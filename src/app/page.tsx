/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useState, useRef, useEffect } from "react";
import { MediaConnection } from "peerjs";
import { usePeer, useMediaStream } from "@/hooks";
import { VideoPlayer } from "@/components";

export default function Home() {
  const { myPeer } = usePeer();
  const { myStream, videoRefLocal } = useMediaStream();
  const [remoteUserId, setRemoteUserId] = useState("");
  const videoRefRemote = useRef<HTMLVideoElement | null>(null);
  const [activeCall, setActiveCall] = useState<MediaConnection | null>();

  function setRemoteStream(remoteStream: MediaStream | null) {
    if (videoRefRemote.current && remoteStream) {
      videoRefRemote.current.srcObject = remoteStream;
    }
  }

  // Function to start the video call
  const startCall = () => {
    if (!remoteUserId) {
      alert("Please enter a remote user ID");
      return;
    }
    if (myPeer && myStream) {
      console.log("Calling remote user" + remoteUserId);
      const callMade = myPeer.call(remoteUserId, myStream);
      callMade.on("stream", (remoteStream) => {
        setRemoteStream(remoteStream);
      });
      callMade.on("close", () => {
        console.log("Call closed");
        callMade.close();
        setActiveCall(null);
        setRemoteStream(null);
      });
      setActiveCall(callMade);
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
          callRecieved.on("stream", (remoteStream) => {
            setRemoteStream(remoteStream);
          });
          setActiveCall(callRecieved);

          // Handle call closing event
          callRecieved.on("close", () => {
            console.log("Call closed");
            callRecieved.close();
            setActiveCall(null);
            setRemoteStream(null);
          });
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
    console.log("Ending call");
    if (activeCall) {
      activeCall.close();
      activeCall.peerConnection?.close();
      activeCall.remoteStream?.getTracks().forEach((track) => track.stop());
      setActiveCall(null);
      setRemoteStream(null);
    }
  };

  useEffect(() => {
    const handleBeforeUnload = () => {
      endCall(); // Call the endCall function when the user closes the browser/tab
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return (
    <div className="p-10 h-screen">
      <h1>WebRTC 1-to-1 Video Call</h1>
      <div>
        <label>Remote User ID:</label>
        <input
          type="text"
          value={remoteUserId}
          className="border-2 border-blue-300 rounded-lg p-2 w-1/2 font-bold text-blue-900"
          onChange={(e) => setRemoteUserId(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-4 mt-10">
        <VideoPlayer
          peerId={myPeer ? myPeer.id : "..."}
          ref={videoRefLocal}
          muted
        />
        <VideoPlayer peerId={activeCall?.peer ?? ""} ref={videoRefRemote} />
      </div>
      <div className="flex gap-2 mt-2">
        <button
          className="bg-blue-300 rounded-lg p-2 font-bold text-blue-900"
          onClick={startCall}
        >
          Start Video Call
        </button>
        <button
          className="bg-red-300 rounded-lg p-2 font-bold text-red-900"
          onClick={endCall}
        >
          End Video Call
        </button>
      </div>
    </div>
  );
}
