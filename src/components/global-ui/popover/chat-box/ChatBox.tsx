'use client';

import { SendHorizonal, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import ChatBoxSkeleton from './ChatBoxSkeleton';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { deleteMessage, getChatMessages, resetUnseenMessageCount, sendMessage } from '@/utils/client/api/api-chat-box';
import { ApiChatBoxMessageType } from '@/utils/constants';
import { addNewMessage, deleteChatMessage, setActiveUserChats, setCountOfUnseenMessage } from '@/lib/features/chat-box-slice/chatBoxSlice';
import { chatBoxUserChatType } from '@/types/client-types';

export default function ChatBox() {
    const currentUserId = useAppSelector(state => state.userStore.user?._id);
    const participantId = useAppSelector(state => state.chatBoxStore.activeUserChat.user?._id);
    const chatMessages = useAppSelector(state => state.chatBoxStore.activeUserChat.chats);
    const [message, setMessage] = useState<string>('');
    const dispatch = useAppDispatch();
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const data = await getChatMessages(ApiChatBoxMessageType.GET_MESSAGES, participantId);
            const isResetSuccess = await resetUnseenMessageCount(participantId!);
            if (isResetSuccess) {
                dispatch(setCountOfUnseenMessage(0));
            }
            dispatch(setActiveUserChats(data as chatBoxUserChatType[]));
            setLoading(false);
        };
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [participantId]);

    useEffect(() => {
        const messagesContainer = document.querySelector('.messages-container');
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }, [chatMessages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;
        const data = await sendMessage(participantId!, message);
        if (data) {
            dispatch(addNewMessage(data));
        }
        setMessage('');
    };

    const handleDeleteMessage = async (messageId: string) => {
        const isMessageDeleted = await deleteMessage(participantId!, messageId);
        if (isMessageDeleted) {
            dispatch(deleteChatMessage(messageId));
        }
    };

    if (loading) return <ChatBoxSkeleton />;

    return (
        <div className="flex flex-col w-full max-h-[400px] overflow-hidden bg-white rounded-lg shadow-md">
            {/* Messages container */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2 messages-container">
                {chatMessages.map((message, index) => {
                    const isOwnMessage = currentUserId === message.user_id;
                    return (
                        <div
                            key={message._id + index}
                            className={`group relative max-w-[70%] break-words p-2 rounded-md w-fit ${isOwnMessage
                                ? 'bg-black text-white ml-auto'
                                : 'bg-gray-100 text-gray-900'
                                }`}
                        >
                            {message.message}

                            {/* Delete button on hover */}
                            {isOwnMessage && (
                                <button
                                    onClick={() => handleDeleteMessage(message._id)}
                                    className="absolute -top-2 -right-2 p-1 rounded-full bg-gray-800 hover:bg-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                    title="Delete message"
                                >
                                    <Trash2 className="w-4 h-4 text-white" />
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Input area */}
            <form onSubmit={handleSendMessage} className="flex items-center gap-2 mt-2 pt-2 border-t p-2">
                <input
                    name="typing-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="flex-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring focus:border-blue-300"
                    placeholder="Type your message..."
                />
                <button
                    type="submit"
                    disabled={!message.trim()}
                    className="p-2 bg-black rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <SendHorizonal className="w-4 h-4 text-white" />
                </button>
            </form>
        </div>
    );
}
