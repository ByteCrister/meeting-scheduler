import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CallParticipant } from '../../services/VideoCallService';
import {
    Signal,
    // Mic, 
    MicOff,
    // Video, 
    VideoOff,
    Share2
} from 'lucide-react';

interface ParticipantsPanelProps {
    isOpen: boolean;
    participants: CallParticipant[];
    userId: string;
    connectionQuality: Record<string, 'good' | 'medium' | 'poor'>;
    onClose: () => void;
}

export const ParticipantsPanel: React.FC<ParticipantsPanelProps> = ({
    isOpen,
    participants,
    userId,
    connectionQuality,
    onClose
}) => {
    const getConnectionQualityColor = (quality: 'good' | 'medium' | 'poor'): string => {
        switch (quality) {
            case 'good': return 'text-green-500';
            case 'medium': return 'text-yellow-500';
            case 'poor': return 'text-red-500';
            default: return 'text-gray-500';
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="absolute top-0 right-0 w-80 h-full bg-gray-800/90 backdrop-blur-sm p-4 shadow-xl"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-white">Participants</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            ×
                        </button>
                    </div>
                    <div className="space-y-3">
                        {participants.map((participant) => (
                            <motion.div
                                key={participant.userId}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="flex items-center justify-between p-3 bg-gray-700/50 rounded-xl backdrop-blur-sm"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-sm font-medium">
                                        {participant.userId === userId ? 'You' : participant.userId.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-white">
                                            {participant.userId === userId ? 'You' : `Participant ${participant.userId}`}
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            {!participant.isVideoOn && (
                                                <VideoOff size={14} className="text-gray-400" />
                                            )}
                                            {participant.isMuted && (
                                                <MicOff size={14} className="text-gray-400" />
                                            )}
                                            {participant.isScreenSharing && (
                                                <Share2 size={14} className="text-blue-400" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {connectionQuality[participant.userId] && (
                                    <div className="flex items-center gap-1">
                                        <Signal
                                            size={16}
                                            className={getConnectionQualityColor(connectionQuality[participant.userId])}
                                        />
                                        <span className="text-xs text-gray-400">
                                            {connectionQuality[participant.userId]}
                                        </span>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}; 