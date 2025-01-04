"use client";
import React, { useRef, useEffect } from "react";
import Peer, { MediaConnection } from "peerjs";

// Simulated JSON data
const mediaData = [
  {
    id: 1,
    type: "video",
    url: "https://videos.pexels.com/video-files/4008365/4008365-uhd_1440_2732_25fps.mp4",
    description: "Video 1 description",
  },
  {
    id: 2,
    type: "live",
    streamId: "93a002e9-b4bf-4099-9a94-3f4dd45fb5a5",
    description: "Live 1 description",
  },
  {
    id: 3,
    type: "video",
    url: "https://videos.pexels.com/video-files/3402899/3402899-uhd_1440_2732_25fps.mp4",
    description: "Video 2 description",
  },
  {
    id: 4,
    type: "live",
    streamId: "live-stream-002",
    description: "Live 2 description",
  },
  {
    id: 5,
    type: "video",
    url: "https://videos.pexels.com/video-files/5377268/5377268-uhd_1440_2560_25fps.mp4",
    description: "Video 3 description",
  },
  {
    id: 6,
    type: "live",
    streamId: "live-stream-003",
    description: "Live 3 description",
  },
  {
    id: 7,
    type: "video",
    url: "https://www.w3schools.com/html/movie.mp4",

    description: "Video 4 description",
  },
  {
    id: 8,
    type: "live",
    streamId: "live-stream-004",
    description: "Live 4 description",
  },
  {
    id: 9,
    type: "video",
    url: "https://www.w3schools.com/html/mov_bbb.mp4",
    description: "Video 5 description",
  },
];

// Shared Peer instance for live streams
const peer = new Peer();

// Video component
const Video = ({ url, description }: { url: string; description: string }) => {
  return (
    <>
      <video
        controls
        autoPlay
        muted
        loop
        className="h-full w-full object-cover"
      >
        <source src={url} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <p className="text-lg absolute bottom-14 text-black font-bold bg-white p-2 rounded-lg w-[90%] bg-opacity-60">
        {description}
      </p>
    </>
  );
};

// Live component
const Live = ({
  streamId,
  description,
}: {
  streamId: string;
  description: string;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const callRef = useRef<MediaConnection | null>(null);

  useEffect(() => {
    // Check if there's an existing call for this streamId
    if (!callRef.current) {
      console.log("Calling streamId:", streamId, "from:", peer.id);
      const localStream = new MediaStream(); // Dummy stream for compatibility
      const call = peer.call(streamId, localStream); // Outgoing call to the streamId      call?.on('stream', handleStream); // Listen for incoming media stream
      call.on("stream", (remoteStream: MediaStream) => {
        console.log("Stream received for streamId:", streamId);
        if (videoRef.current) {
          videoRef.current.srcObject = remoteStream;
          videoRef.current
            .play()
            .catch((error) => console.error("Video play error:", error));
        }
      });
      // Listen for incoming media stream
      console.log("Call established for streamId:", streamId);
      callRef.current = call;
    }

    const videoElement = videoRef.current;

    return () => {
      if (videoElement) {
        videoElement.srcObject = null;
      }
      // Do not close the call, keep it active for re-entry
    };
  }, [streamId]);

  return (
    <>
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="h-full w-full object-cover"
      />
      <p className=" text-lg absolute top-10 text-black font-bold bg-white p-2 rounded-lg w-[90%] bg-opacity-60">
        {description}
      </p>
    </>
  );
};

// Main TikTok-like scroll component
const TikTokScroll = () => {
  return (
    <div
      style={{
        height: "100vh",
        overflowY: "auto",
        scrollSnapType: "y mandatory",
        touchAction: "pan-y",
      }}
    >
      {[...mediaData, ...mediaData, ...mediaData].map((data, index) => (
        <div
          className="h-[90vh] md:h-[100vh]"
          key={index}
          style={{
            width: "100%",
            scrollSnapAlign: "start",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div className="flex flex-col justify-start items-center bg-black text-white relative overflow-hidden h-full w-full">
            {data.type === "video" ? (
              <Video url={data.url!} description={data.description} />
            ) : (
              <Live streamId={data.streamId!} description={data.description} />
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TikTokScroll;
