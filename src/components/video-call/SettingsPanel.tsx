import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface SettingsPanelProps {
    isOpen: boolean;
    onClose: () => void;
    onVideoQualityChange: (quality: string) => void;
    onAudioDeviceChange: (deviceId: string) => void;
    onVideoDeviceChange: (deviceId: string) => void;
}

interface MediaDevice {
    deviceId: string;
    label: string;
    kind: string;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
    isOpen,
    onClose,
    onVideoQualityChange,
    onAudioDeviceChange,
    onVideoDeviceChange
}) => {
    const [audioDevices, setAudioDevices] = useState<MediaDevice[]>([]);
    const [videoDevices, setVideoDevices] = useState<MediaDevice[]>([]);
    const [selectedVideoQuality, setSelectedVideoQuality] = useState('auto');

    useEffect(() => {
        const getDevices = async () => {
            try {
                const devices = await navigator.mediaDevices.enumerateDevices();
                const audioInputs = devices.filter(device => device.kind === 'audioinput');
                const videoInputs = devices.filter(device => device.kind === 'videoinput');
                setAudioDevices(audioInputs);
                setVideoDevices(videoInputs);
            } catch (error) {
                console.error('Error getting devices:', error);
            }
        };

        getDevices();
    }, []);

    const handleVideoQualityChange = (quality: string) => {
        setSelectedVideoQuality(quality);
        onVideoQualityChange(quality);
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
                        <h2 className="text-lg font-semibold text-white">Settings</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* Video Quality */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Video Quality</label>
                            <div className="grid grid-cols-2 gap-2">
                                {['auto', 'high', 'medium', 'low'].map((quality) => (
                                    <button
                                        key={quality}
                                        onClick={() => handleVideoQualityChange(quality)}
                                        className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                                            selectedVideoQuality === quality
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        }`}
                                    >
                                        {quality.charAt(0).toUpperCase() + quality.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Audio Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Audio Input</label>
                            <select
                                onChange={(e) => onAudioDeviceChange(e.target.value)}
                                className="w-full p-2 bg-gray-700 rounded-lg text-white border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                            >
                                {audioDevices.map((device) => (
                                    <option key={device.deviceId} value={device.deviceId}>
                                        {device.label || `Audio Input ${device.deviceId.slice(0, 5)}`}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Video Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Video Input</label>
                            <select
                                onChange={(e) => onVideoDeviceChange(e.target.value)}
                                className="w-full p-2 bg-gray-700 rounded-lg text-white border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                            >
                                {videoDevices.map((device) => (
                                    <option key={device.deviceId} value={device.deviceId}>
                                        {device.label || `Video Input ${device.deviceId.slice(0, 5)}`}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Advanced Settings */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Advanced Settings</label>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm text-gray-300">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                                    />
                                    Noise Suppression
                                </label>
                                <label className="flex items-center gap-2 text-sm text-gray-300">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                                    />
                                    Echo Cancellation
                                </label>
                                <label className="flex items-center gap-2 text-sm text-gray-300">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                                    />
                                    Auto Gain Control
                                </label>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}; 