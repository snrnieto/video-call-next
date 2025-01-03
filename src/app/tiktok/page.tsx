"use client";
import React, { useState, useRef, useEffect } from "react";
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
    url: "https://videos.pexels.com/video-files/29765109/12791166_1440_2560_60fps.mp4",
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
    <div className="h-screen flex flex-col justify-center items-center bg-black text-white">
      <video className="h-4/5" controls autoPlay muted loop>
        <source src={url} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <p className="mt-4 text-lg">{description}</p>
    </div>
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
    <div className="h-screen flex flex-col justify-center items-center bg-red-600 text-white">
      <video ref={videoRef} className="h-4/5" autoPlay muted playsInline />
      <p className="mt-4 text-lg">{description}</p>
    </div>
  );
};

// Main TikTok-like scroll component
const TikTokScroll = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartY = useRef<number | null>(null);
  const touchEndY = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (event: React.WheelEvent) => {
    const direction = event.deltaY > 0 ? 1 : -1;
    const newIndex = Math.min(
      Math.max(currentIndex + direction, 0),
      mediaData.length - 1
    );
    setCurrentIndex(newIndex);
  };

  const handleTouchStart = (event: React.TouchEvent) => {
    touchStartY.current = event.touches[0].clientY;
  };

  const handleTouchMove = (event: React.TouchEvent) => {
    touchEndY.current = event.touches[0].clientY;
  };

  const handleTouchEnd = () => {
    if (touchStartY.current !== null && touchEndY.current !== null) {
      const direction = touchStartY.current - touchEndY.current > 0 ? 1 : -1;
      const newIndex = Math.min(
        Math.max(currentIndex + direction, 0),
        mediaData.length - 1
      );
      setCurrentIndex(newIndex);
    }
    touchStartY.current = null;
    touchEndY.current = null;
  };

  const renderMedia = () => {
    const currentMedia = mediaData[currentIndex];
    if (currentMedia.type === "video") {
      return (
        <Video url={currentMedia.url!} description={currentMedia.description} />
      );
    } else if (currentMedia.type === "live") {
      return (
        <Live
          streamId={currentMedia.streamId!}
          description={currentMedia.description}
        />
      );
    }
    return null;
  };

  return (
    <div
      ref={containerRef}
      className="w-screen h-screen overflow-hidden"
      onWheel={handleScroll}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {renderMedia()}
    </div>
  );
};

export default TikTokScroll;
