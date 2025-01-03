import React from "react";

interface VideoPlayerProps extends React.HTMLProps<HTMLVideoElement> {
  peerId: string;
}
export const VideoPlayer = (props: VideoPlayerProps) => {
  const { peerId, ...videoProps } = props;
  return (
    <div className="bg-gray-200 flex flex-col items-center justify-center p-4 h-full w-full">
      <span className="text-black font-bold">{peerId}</span>
      <video autoPlay {...videoProps} />
    </div>
  );
};
