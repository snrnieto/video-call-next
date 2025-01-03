import { useState, useEffect, useRef } from "react";

export const useMediaStream = () => {
  const videoRefLocal = useRef<HTMLVideoElement | null>(null);
  const [myStream, setMyStream] = useState<MediaStream | null>(null);
  const isStreamSet = useRef(false);

  useEffect(() => {
    if (isStreamSet.current) return;
    if (typeof window === "undefined" && !navigator) return;
    isStreamSet.current = true;
    (async function initStream() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });
        console.log("setting your stream");
        setMyStream(stream);
        videoRefLocal.current!.srcObject = stream;
      } catch (e) {
        console.log("Error in media navigator", e);
      }
    })();
  }, []);

  return {
    myStream,
    videoRefLocal,
  };
};
