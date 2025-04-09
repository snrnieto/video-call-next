/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useState, useRef, useEffect } from "react";
import { MediaConnection } from "peerjs";
import { usePeer, useMediaStream } from "@/hooks";
import { VideoPlayer } from "@/components";
import { RoomClient } from "@/services/room.client";
import { Room, RoomStatus } from "@/models/room";
import { useRouter } from "next/navigation";

export default function Home() {
  const { myPeer } = usePeer();
  const { myStream, videoRefLocal } = useMediaStream();
  const videoRefRemote = useRef<HTMLVideoElement | null>(null);
  const [activeCall, setActiveCall] = useState<MediaConnection | null>();
  const [isSearching, setIsSearching] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const roomClient = new RoomClient();
  const router = useRouter();
  console.log({
    currentRoom,
    myPeerId: myPeer?.id,
    activeCallId: activeCall?.peer,
    remotePeerId: currentRoom?.userAPeerId,
    isSearching,
  });  
  function setRemoteStream(remoteStream: MediaStream | null) {
    if (videoRefRemote.current) {
      if (remoteStream) {
        videoRefRemote.current.srcObject = remoteStream;
      } else {
        // Clear the video element when stream is null
        videoRefRemote.current.srcObject = null;
        videoRefRemote.current.load(); // This forces the video element to clear
      }
    }
  }

  // Function to start the video call
  const startCall = async () => {
    if (!myPeer || !myStream) return;

    setIsSearching(true);
    try {
      // First, try to find a waiting room
      const waitingRoom = await roomClient.findWaitingRoom();
      
      if (waitingRoom) {
        // If we found a waiting room, join it
        const updatedRoom = await roomClient.joinRoom(waitingRoom.id, myPeer.id);
        setCurrentRoom(updatedRoom);
        
        // Start the call with the user in the room
        console.log("Calling remote user", waitingRoom.userAPeerId);
        const callMade = myPeer.call(waitingRoom.userAPeerId, myStream);
        handleCallEvents(callMade);
      } else {
        // If no waiting room found, create a new one
        const newRoom = await roomClient.createRoom(myPeer.id);
        setCurrentRoom(newRoom);
        // Show waiting message
      }
    } catch (error) {
      console.error("Error in startCall:", error);
      setIsSearching(false);
    }
  };

  const handleCallEvents = (call: MediaConnection) => {
    call.on("stream", (remoteStream) => {
      setRemoteStream(remoteStream);
      setIsSearching(false);
      console.log("Call connected successfully");
    });

    call.on("close", () => {
      console.log("Call closed by remote user");
      handleCallEnd(true); // Pass true to indicate automatic reconnect
    });

    call.on("error", (error) => {
      console.error("Call error:", error);
      handleCallEnd(true); // Pass true to indicate automatic reconnect
    });

    // Monitor connection state
    call.peerConnection.onconnectionstatechange = () => {
      if (call.peerConnection.connectionState === 'disconnected' || 
          call.peerConnection.connectionState === 'failed' ||
          call.peerConnection.connectionState === 'closed') {
        console.log("Connection state changed to:", call.peerConnection.connectionState);
        handleCallEnd(true); // Pass true to indicate automatic reconnect
      }
    };

    setActiveCall(call);
  };

  const handleCallEnd = async (autoReconnect: boolean = false) => {
    console.log("Call ended - cleaning up resources");
    if (activeCall) {
      activeCall.close();
      activeCall.peerConnection?.close();
      activeCall.remoteStream?.getTracks().forEach((track) => track.stop());
    }

    // Update room status to CLOSED if we have a current room
    if (currentRoom) {
      try {
        await roomClient.updateRoomStatus(currentRoom.id, RoomStatus.CLOSED);
      } catch (error) {
        console.error("Error updating room status:", error);
      }
    }

    setActiveCall(null);
    setRemoteStream(null);
    setCurrentRoom(null);
    setIsSearching(false);

    // If autoReconnect is true, start searching for a new call
    if (autoReconnect) {
      console.log("Automatically searching for a new call...");
      startCall();
    }
  };

  useEffect(() => {
    if (myPeer) {
      myPeer.on("call", (callRecieved) => {
        console.log(
          "Someone is calling me to my peer ID:",
          myPeer.id,
          "fromPeer:",
          callRecieved.peer
        );
        try {
          callRecieved.answer(myStream!);
          console.log("Answering call");
          handleCallEvents(callRecieved);
        } catch (err) {
          console.error("Failed to get local stream", err);
        }
      });
    }
  }, [myPeer]);

  useEffect(() => {
    if (videoRefLocal.current && myStream) {
      videoRefLocal.current.srcObject = myStream;
    }
  }, [videoRefLocal, myStream]);

  const endCall = () => {
    console.log("Call ended by local user");
    handleCallEnd(false); // Pass false to prevent automatic reconnect
    router.refresh();
  };

  const nextCall = () => {
    console.log("Moving to next call");
    handleCallEnd(true); // Pass true to automatically start a new call
  };

  useEffect(() => {
    const handleBeforeUnload = () => {
      endCall();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 text-center mb-8">
          Video Chat
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="relative bg-white rounded-xl shadow-lg overflow-hidden">
            <VideoPlayer
              peerId={myPeer ? myPeer.id : "..."}
              ref={videoRefLocal}
              muted
              className="w-full aspect-video"
            />
            <div className="absolute bottom-4 left-4 bg-black/70 text-white px-4 py-2 rounded-lg">
              <span className="text-sm font-medium">You: {myPeer?.id || "..."}</span>
            </div>
          </div>

          <div className="relative bg-white rounded-xl shadow-lg overflow-hidden">
            <VideoPlayer 
              peerId={activeCall?.peer ?? ""} 
              ref={videoRefRemote}
              className={`w-full aspect-video ${!activeCall ? 'opacity-50' : ''}`}
            />
            <div className="absolute bottom-4 left-4 bg-black/70 text-white px-4 py-2 rounded-lg">
              <span className="text-sm font-medium">
                {activeCall ? `Peer: ${activeCall.peer}` : "Waiting for connection..."}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-center gap-4">
          {activeCall ? (
            <>
              <button
                className="flex-1 md:flex-none bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                onClick={nextCall}
                disabled={isSearching}
              >
                Next Call
              </button>
              <button
                className="flex-1 md:flex-none bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                onClick={endCall}
              >
                End Call
              </button>
            </>
          ) : (
            <button
              className="flex-1 md:flex-none bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              onClick={startCall}
              disabled={isSearching}
            >
              {isSearching ? "Searching for a call..." : "Start New Call"}
            </button>
          )}
        </div>

        {isSearching && !activeCall && (
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg">
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="font-medium">Waiting for someone to join...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
