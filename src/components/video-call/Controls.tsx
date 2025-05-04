import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Mic, 
    MicOff, 
    Video, 
    VideoOff, 
    Share2, 
    Phone, 
    Users, 
    Settings, 
    MessageSquare,
    Maximize2,
    Minimize2
} from 'lucide-react';

interface ControlsProps {
    isMuted: boolean;
    isVideoOn: boolean;
    isScreenSharing: boolean;
    onToggleMute: () => void;
    onToggleVideo: () => void;
    onToggleScreenShare: () => void;
    onToggleParticipants: () => void;
    onToggleSettings: () => void;
    onEndCall: () => void;
    onToggleChat: () => void;
    onToggleFullscreen: () => void;
}

export const Controls: React.FC<ControlsProps> = ({
    isMuted,
    isVideoOn,
    isScreenSharing,
    onToggleMute,
    onToggleVideo,
    onToggleScreenShare,
    onToggleParticipants,
    onToggleSettings,
    onEndCall,
    onToggleChat,
    onToggleFullscreen
}) => {
    const [isFullscreen, setIsFullscreen] = React.useState(false);

    React.useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const controlButtons = [
        {
            icon: isMuted ? MicOff : Mic,
            onClick: onToggleMute,
            className: isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600',
            tooltip: isMuted ? 'Unmute' : 'Mute',
            animation: { scale: 1.1 }
        },
        {
            icon: isVideoOn ? Video : VideoOff,
            onClick: onToggleVideo,
            className: !isVideoOn ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600',
            tooltip: isVideoOn ? 'Turn off camera' : 'Turn on camera',
            animation: { scale: 1.1 }
        },
        {
            icon: Share2,
            onClick: onToggleScreenShare,
            className: isScreenSharing ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-700 hover:bg-gray-600',
            tooltip: isScreenSharing ? 'Stop sharing' : 'Share screen',
            animation: { scale: 1.1 }
        },
        {
            icon: MessageSquare,
            onClick: onToggleChat,
            className: 'bg-gray-700 hover:bg-gray-600',
            tooltip: 'Toggle chat',
            animation: { scale: 1.1 }
        },
        {
            icon: Users,
            onClick: onToggleParticipants,
            className: 'bg-gray-700 hover:bg-gray-600',
            tooltip: 'Show participants',
            animation: { scale: 1.1 }
        },
        {
            icon: Settings,
            onClick: onToggleSettings,
            className: 'bg-gray-700 hover:bg-gray-600',
            tooltip: 'Settings',
            animation: { scale: 1.1 }
        },
        {
            icon: isFullscreen ? Minimize2 : Maximize2,
            onClick: onToggleFullscreen,
            className: 'bg-gray-700 hover:bg-gray-600',
            tooltip: isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen',
            animation: { scale: 1.1 }
        },
        {
            icon: Phone,
            onClick: onEndCall,
            className: 'bg-red-500 hover:bg-red-600',
            tooltip: 'End call',
            animation: { scale: 1.1, rotate: 180 }
        }
    ];

    return (
        <motion.div 
            className="absolute bottom-0 left-0 right-0 bg-gray-800/90 backdrop-blur-sm p-4"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            <div className="flex items-center justify-center gap-4">
                <AnimatePresence>
                    {controlButtons.map((button, index) => (
                        <motion.button
                            key={index}
                            whileHover={button.animation}
                            whileTap={{ scale: 0.95 }}
                            onClick={button.onClick}
                            className={`p-3 rounded-full ${button.className} transition-all duration-200 relative group`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: index * 0.05 }}
                        >
                            <button.icon size={24} className="text-white" />
                            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap shadow-lg">
                                {button.tooltip}
                            </span>
                        </motion.button>
                    ))}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}; 