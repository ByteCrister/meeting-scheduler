import { CallParticipant } from '@/services/VideoCallService';
import React, { useEffect, useRef } from 'react';
interface VideoGridProps {
    participants: CallParticipant[];
    userId: string;
    connectionQuality: Record<string, 'good' | 'medium' | 'poor'>;
    onStreamReceived: (userId: string, stream: MediaStream) => void;
  }
  
export const VideoGrid: React.FC<VideoGridProps> = ({
  participants,
  userId,
  connectionQuality,
  onStreamReceived,
}) => {
  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      {participants.map(participant => (
        <VideoTile
          key={participant.userId}
          participant={participant}
          isCurrentUser={participant.userId === userId}
          connectionQuality={connectionQuality[participant.userId]}
          onStreamReceived={onStreamReceived}
        />
      ))}
    </div>
  );
};

const VideoTile = ({
  participant,
  isCurrentUser,
  connectionQuality,
  onStreamReceived,
}: {
  participant: CallParticipant;
  isCurrentUser: boolean;
  connectionQuality?: 'good' | 'medium' | 'poor';
  onStreamReceived: (userId: string, stream: MediaStream) => void;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (participant.stream && videoRef.current) {
      videoRef.current.srcObject = participant.stream;

      // Notify parent only once per stream
      onStreamReceived(participant.userId, participant.stream);
    }
  }, [participant.stream, participant.userId, onStreamReceived]);

  return (
    <div className="relative rounded bg-black overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isCurrentUser}
        className="w-full h-full object-cover"
      />
      <div className="absolute bottom-0 left-0 right-0 p-2 text-sm bg-black/60 text-white">
        {isCurrentUser ? 'You' : participant.userId} ({connectionQuality ?? 'unknown'})
      </div>
    </div>
  );
};
