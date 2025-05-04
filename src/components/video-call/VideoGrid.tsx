import { CallParticipant } from '@/services/VideoCallService';
import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MicOff, VideoOff, Wifi, WifiOff } from 'lucide-react';

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
    const getGridClass = (count: number) => {
        if (count === 1) return 'grid-cols-1';
        if (count === 2) return 'grid-cols-2';
        if (count <= 4) return 'grid-cols-2';
        if (count <= 6) return 'grid-cols-3';
        return 'grid-cols-4';
    };

    return (
        <div className={`grid ${getGridClass(participants.length)} gap-4 p-4 h-full`}>
            <AnimatePresence>
                {participants.map(participant => (
                    <motion.div
                        key={participant.userId}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                    >
                        <VideoTile
                            participant={participant}
                            isCurrentUser={participant.userId === userId}
                            connectionQuality={connectionQuality[participant.userId]}
                            onStreamReceived={onStreamReceived}
                        />
                    </motion.div>
                ))}
            </AnimatePresence>
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
            onStreamReceived(participant.userId, participant.stream);
        }
    }, [participant.stream, participant.userId, onStreamReceived]);

    const getConnectionQualityColor = (quality?: 'good' | 'medium' | 'poor') => {
        switch (quality) {
            case 'good': return 'text-green-500';
            case 'medium': return 'text-yellow-500';
            case 'poor': return 'text-red-500';
            default: return 'text-gray-500';
        }
    };

    return (
        <div className="relative aspect-video rounded-xl bg-gray-800 overflow-hidden group">
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted={isCurrentUser}
                className="w-full h-full object-cover"
            />
            
            {/* Overlay with user info and controls */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="absolute bottom-0 left-0 right-0 p-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-white font-medium">
                                {isCurrentUser ? 'You' : participant.userId}
                            </span>
                            <div className={`flex items-center gap-1 ${getConnectionQualityColor(connectionQuality)}`}>
                                {connectionQuality === 'good' ? (
                                    <Wifi size={16} />
                                ) : (
                                    <WifiOff size={16} />
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {!participant.isVideoOn && (
                                <div className="p-1 bg-red-500 rounded-full">
                                    <VideoOff size={16} className="text-white" />
                                </div>
                            )}
                            {participant.isMuted && (
                                <div className="p-1 bg-red-500 rounded-full">
                                    <MicOff size={16} className="text-white" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Video/Audio off indicators */}
            {!participant.isVideoOn && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                    <div className="text-center">
                        <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-2">
                            <VideoOff size={32} className="text-gray-400" />
                        </div>
                        <p className="text-gray-400 font-medium">
                            {isCurrentUser ? 'Your camera is off' : 'Camera is off'}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
