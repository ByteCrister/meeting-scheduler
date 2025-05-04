import React, { useEffect, useRef, useState } from 'react';
import { VideoCallService } from '../../services/VideoCallService';
import { VideoGrid } from './VideoGrid';
import { Controls } from './Controls';
import { ParticipantsPanel } from './ParticipantsPanel';
import { SettingsPanel } from './SettingsPanel';
import { ChatPanel } from './ChatPanel';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import {
    addMessage,
    addParticipant,
    removeParticipant,
    resetVideoCallState,
    setConnectionQuality,
    setMuted,
    setScreenSharing,
    setVideoOn,
    updateStream
} from '@/lib/features/video-call-slice/videoCallSlice';
import { updateVideoCall } from '@/utils/client/api/api-video-meeting-call';

interface VideoCallInterfaceProps {
    meetingId: string;
    onEndCall: () => void;
}

export const VideoCallInterface: React.FC<VideoCallInterfaceProps> = ({
    meetingId,
    onEndCall
}) => {
    const userId = useAppSelector(state => state.userStore.user?._id) || '';
    const dispatch = useAppDispatch();

    const {
        participants,
        isMuted,
        isVideoOn,
        isScreenSharing,
        connectionQuality,
        messages,
    } = useAppSelector((state) => state.videoCallStore);

    const [isParticipantsPanelOpen, setIsParticipantsPanelOpen] = useState(false);
    const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false);
    const [isChatPanelOpen, setIsChatPanelOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isControlsVisible, setIsControlsVisible] = useState(true);

    const videoCallService = useRef<VideoCallService | null>(null);
    const controlsTimeout = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const initializeCall = async () => {
            try {
                videoCallService.current = new VideoCallService(meetingId, userId);

                // Set up event listeners
                videoCallService.current.onParticipantJoined = (participant) => {
                    dispatch(addParticipant(participant));
                };

                videoCallService.current.onParticipantLeft = (participantId) => {
                    dispatch(removeParticipant(participantId));
                };

                videoCallService.current.onStreamReceived = (participantId, stream) => {
                    dispatch(updateStream({ userId: participantId, stream }));
                };

                videoCallService.current.onConnectionQualityChanged = (participantId, quality) => {
                    dispatch(setConnectionQuality({ userId: participantId, quality }));
                };

                videoCallService.current.onMessageReceived = (participantId, message) => {
                    dispatch(addMessage({
                        userId: participantId,
                        message,
                        timestamp: new Date(),
                    }));
                };

                videoCallService.current.onError = (error) => {
                    setError(error.message);
                };

                // Initialize local stream
                await videoCallService.current.initializeLocalStream(true, true);

                // Start the call
                await videoCallService.current.startCall();

                // Set initial state for local stream
                dispatch(setMuted(false));
                dispatch(setVideoOn(true));
                dispatch(setScreenSharing(false));
            } catch (error) {
                console.log(error)
                setError('Failed to initialize video call. Please try again.');
                setTimeout(() => {
                    onEndCall();
                }, 3000);
            }
        };

        initializeCall();

        return () => {
            if (videoCallService.current) {
                videoCallService.current.cleanup();
            }
            dispatch(resetVideoCallState());
        };
    }, [meetingId, userId, onEndCall, dispatch]);

    const handleMouseMove = () => {
        setIsControlsVisible(true);
        if (controlsTimeout.current) {
            clearTimeout(controlsTimeout.current);
        }
        controlsTimeout.current = setTimeout(() => {
            setIsControlsVisible(false);
        }, 3000);
    };

    const handleToggleMute = async () => {
        if (videoCallService.current) {
            try {
                await videoCallService.current.toggleAudio(!isMuted);
                dispatch(setMuted(!isMuted));
                await updateVideoCall({ meetingId, isMuted: !isMuted });
            } catch {
                setError('Failed to toggle audio. Please try again.');
            }
        }
    };

    const handleToggleVideo = async () => {
        if (videoCallService.current) {
            try {
                await videoCallService.current.toggleVideo(!isVideoOn);
                dispatch(setVideoOn(!isVideoOn));
                await updateVideoCall({ meetingId, isVideoOn: !isVideoOn });
            } catch {
                setError('Failed to toggle video. Please try again.');
            }
        }
    };

    const handleToggleScreenShare = async () => {
        if (videoCallService.current) {
            try {
                if (!isScreenSharing) {
                    await videoCallService.current.startScreenShare();
                } else {
                    await videoCallService.current.stopScreenShare();
                }
                dispatch(setScreenSharing(!isScreenSharing));
                await updateVideoCall({ meetingId, isScreenSharing: !isScreenSharing });
            } catch {
                setError('Failed to toggle screen sharing. Please try again.');
            }
        }
    };

    const handleSendMessage = async (message: string) => {
        if (videoCallService.current) {
            try {
                videoCallService.current.sendMessage(message);
                dispatch(addMessage({
                    userId,
                    message,
                    timestamp: new Date(),
                }));
                await updateVideoCall({ meetingId, message });
            } catch {
                setError('Failed to send message. Please try again.');
            }
        }
    };

    const handleVideoQualityChange = (quality: string) => {
        if (videoCallService.current) {
            try {
                videoCallService.current.setVideoQuality(quality);
            } catch {
                setError('Failed to change video quality. Please try again.');
            }
        }
    };

    const handleAudioDeviceChange = async (deviceId: string) => {
        if (videoCallService.current) {
            try {
                await videoCallService.current.setAudioDevice(deviceId);
            } catch {
                setError('Failed to change audio device. Please try again.');
            }
        }
    };

    const handleVideoDeviceChange = async (deviceId: string) => {
        if (videoCallService.current) {
            try {
                await videoCallService.current.setVideoDevice(deviceId);
            } catch {
                setError('Failed to change video device. Please try again.');
            }
        }
    };

    const handleToggleFullscreen = () => {
        try {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
        } catch {
            setError('Failed to toggle fullscreen. Please try again.');
        }
    };

    const handleEndCall = () => {
        if (videoCallService.current) {
            videoCallService.current.cleanup();
        }
        onEndCall();
    };

    return (
        <div
            className="relative w-full h-screen bg-gray-900 text-white overflow-hidden"
            onMouseMove={handleMouseMove}
        >
            {/* Error Message */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50"
                    >
                        <div className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg">
                            <AlertCircle size={20} />
                            <span>{error}</span>
                            <button
                                onClick={() => setError(null)}
                                className="ml-2 hover:text-gray-200 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <VideoGrid
                participants={participants}
                userId={userId}
                connectionQuality={connectionQuality}
                onStreamReceived={(userId, stream) => {
                    dispatch(updateStream({ userId, stream }));
                }}
            />

            <AnimatePresence>
                {isControlsVisible && (
                    <Controls
                        isMuted={isMuted}
                        isVideoOn={isVideoOn}
                        isScreenSharing={isScreenSharing}
                        onToggleMute={handleToggleMute}
                        onToggleVideo={handleToggleVideo}
                        onToggleScreenShare={handleToggleScreenShare}
                        onToggleParticipants={() => setIsParticipantsPanelOpen(!isParticipantsPanelOpen)}
                        onToggleSettings={() => setIsSettingsPanelOpen(!isSettingsPanelOpen)}
                        onToggleChat={() => setIsChatPanelOpen(!isChatPanelOpen)}
                        onEndCall={handleEndCall}
                        onToggleFullscreen={handleToggleFullscreen}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isParticipantsPanelOpen && (
                    <ParticipantsPanel
                        isOpen={isParticipantsPanelOpen}
                        participants={participants}
                        userId={userId}
                        connectionQuality={connectionQuality}
                        onClose={() => setIsParticipantsPanelOpen(false)}
                    />
                )}

                {isSettingsPanelOpen && (
                    <SettingsPanel
                        isOpen={isSettingsPanelOpen}
                        onClose={() => setIsSettingsPanelOpen(false)}
                        onVideoQualityChange={handleVideoQualityChange}
                        onAudioDeviceChange={handleAudioDeviceChange}
                        onVideoDeviceChange={handleVideoDeviceChange}
                    />
                )}

                {isChatPanelOpen && (
                    <ChatPanel
                        isOpen={isChatPanelOpen}
                        messages={messages}
                        userId={userId}
                        onClose={() => setIsChatPanelOpen(false)}
                        onSendMessage={handleSendMessage}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};
