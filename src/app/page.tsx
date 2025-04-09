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
    <div className="p-10 h-screen">
      <h1>WebRTC 1-to-1 Video Call</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-4 mt-10">
        <VideoPlayer
          peerId={myPeer ? myPeer.id : "..."}
          ref={videoRefLocal}
          muted
        />
        <VideoPlayer 
          peerId={activeCall?.peer ?? ""} 
          ref={videoRefRemote}
          className={!activeCall ? 'opacity-50' : ''}
        />
      </div>
      <div className="flex gap-2 mt-2">
        
        {activeCall ?(
          <>
            <button
              className="bg-green-300 rounded-lg p-2 font-bold text-green-900"
              onClick={nextCall}
              disabled={isSearching}
            >
              Next Call
            </button>
            <button
              className="bg-red-300 rounded-lg p-2 font-bold text-red-900"
              onClick={endCall}
            >
              End Video Call
            </button>
          </>
        ):<button
        className="bg-blue-300 rounded-lg p-2 font-bold text-blue-900"
        onClick={startCall}
        disabled={isSearching}
      >
        {isSearching ? "Searching for a call..." : "Start Video Call"}
      </button>}
      </div>
      {isSearching && !activeCall && (
        <div className="mt-4 text-center">
          <p className="text-blue-600">Waiting for someone to join...</p>
        </div>
      )}
    </div>
  );
}
