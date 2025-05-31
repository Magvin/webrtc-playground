import { useRef, useEffect, ReactNode } from 'react';

type VideoFeedProps = {
  stream: MediaStream | null;
  muted?: boolean;
  className?: string;
  placeholder?: ReactNode;
};

export const VideoFeed = ({
  stream,
  muted = false,
  className = '',
  placeholder,
}: VideoFeedProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  if (!stream) {
    return <>{placeholder}</>;
  }

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted={muted}
      className={className}
    />
  );
};
