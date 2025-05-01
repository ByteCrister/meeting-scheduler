import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send } from 'lucide-react';

export interface ChatMessage {
    userId: string;
    message: string;
    timestamp: Date;
}

interface ChatPanelProps {
    isOpen: boolean;
    messages: ChatMessage[];
    userId: string;
    onClose: () => void;
    onSendMessage: (message: string) => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
    isOpen,
    messages,
    userId,
    onClose,
    onSendMessage
}) => {
    const [message, setMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (message.trim()) {
            onSendMessage(message.trim());
            setMessage('');
        }
    };

    const formatTime = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="absolute top-0 right-0 w-80 h-full bg-gray-800/90 backdrop-blur-sm p-4 shadow-xl flex flex-col"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-white">Chat</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                        {messages.map((msg, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex flex-col ${msg.userId === userId ? 'items-end' : 'items-start'
                                    }`}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs text-gray-400">
                                        {msg.userId === userId ? 'You' : `User ${msg.userId.slice(0, 5)}`}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {formatTime(msg.timestamp)}
                                    </span>
                                </div>
                                <div
                                    className={`max-w-[80%] p-3 rounded-lg ${msg.userId === userId
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-700 text-gray-200'
                                        }`}
                                >
                                    {msg.message}
                                </div>
                            </motion.div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSendMessage} className="flex gap-2">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 p-2 bg-gray-700 rounded-lg text-white border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                        <button
                            type="submit"
                            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            <Send size={20} />
                        </button>
                    </form>
                </motion.div>
            )}
        </AnimatePresence>
    );
}; 