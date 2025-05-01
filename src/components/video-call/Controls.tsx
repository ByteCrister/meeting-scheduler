import React from 'react';
import { motion } from 'framer-motion';
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
    Maximize2
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
    const controlButtons = [
        {
            icon: isMuted ? MicOff : Mic,
            onClick: onToggleMute,
            className: isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600',
            tooltip: isMuted ? 'Unmute' : 'Mute'
        },
        {
            icon: isVideoOn ? Video : VideoOff,
            onClick: onToggleVideo,
            className: !isVideoOn ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600',
            tooltip: isVideoOn ? 'Turn off camera' : 'Turn on camera'
        },
        {
            icon: Share2,
            onClick: onToggleScreenShare,
            className: isScreenSharing ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-700 hover:bg-gray-600',
            tooltip: isScreenSharing ? 'Stop sharing' : 'Share screen'
        },
        {
            icon: MessageSquare,
            onClick: onToggleChat,
            className: 'bg-gray-700 hover:bg-gray-600',
            tooltip: 'Toggle chat'
        },
        {
            icon: Users,
            onClick: onToggleParticipants,
            className: 'bg-gray-700 hover:bg-gray-600',
            tooltip: 'Show participants'
        },
        {
            icon: Settings,
            onClick: onToggleSettings,
            className: 'bg-gray-700 hover:bg-gray-600',
            tooltip: 'Settings'
        },
        {
            icon: Maximize2,
            onClick: onToggleFullscreen,
            className: 'bg-gray-700 hover:bg-gray-600',
            tooltip: 'Toggle fullscreen'
        },
        {
            icon: Phone,
            onClick: onEndCall,
            className: 'bg-red-500 hover:bg-red-600',
            tooltip: 'End call'
        }
    ];

    return (
        <div className="absolute bottom-0 left-0 right-0 bg-gray-800/90 backdrop-blur-sm p-4">
            <div className="flex items-center justify-center gap-4">
                {controlButtons.map((button, index) => (
                    <motion.button
                        key={index}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={button.onClick}
                        className={`p-3 rounded-full ${button.className} transition-colors relative group`}
                    >
                        <button.icon size={24} className="text-white" />
                        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {button.tooltip}
                        </span>
                    </motion.button>
                ))}
            </div>
        </div>
    );
}; 