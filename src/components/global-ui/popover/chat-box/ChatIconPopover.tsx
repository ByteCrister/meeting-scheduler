"use client";

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
    TooltipProvider,
} from "@/components/ui/tooltip";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import ChatBox from "./ChatBox";
import NewMessageDialog from "./NewMessageDialog";
import { BiMessageDetail } from "react-icons/bi";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { getChatMessagesOrUser } from "@/utils/client/api/api-chat-box";
import { ApiChatBoxMessageType } from "@/utils/constants";
import { setChatBoxActiveUser } from "@/lib/features/chat-box-slice/chatBoxSlice";
import { chatBoxUserType } from "@/types/client-types";

export default function ChatIconPopover() {
    const count = useAppSelector(state => state.userStore.countOfUnseenMessages);
    const activeParticipant = useAppSelector(state => state.chatBoxStore.activeUserChat.user);

    const dispatch = useAppDispatch();

    const [loading, setLoading] = useState<boolean>(false);
    const [dialogOpen, setDialogOpen] = useState(false);

    useEffect(() => {
        if (!activeParticipant) {
            const fetchData = async () => {
                setLoading(true);
                const data = await getChatMessagesOrUser(ApiChatBoxMessageType.GET_ACTIVE_USER);
                dispatch(setChatBoxActiveUser(data as chatBoxUserType));
                setLoading(false);
            }
            fetchData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <Popover>
                <PopoverTrigger asChild>
                    <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
                        <BiMessageDetail className="w-5 h-5" />
                        {
                            // Message count badge
                            count !== 0 && <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-red-500 rounded-full shadow-md">
                                {count}
                            </span>
                        }
                    </button>
                </PopoverTrigger>

                <PopoverContent className="w-96 p-4 absolute right-4 top-16 !translate-x-0 !translate-y-0 shadow">
                    {
                        !activeParticipant?._id
                            ? (<div className="h-[300px] flex items-center justify-center">
                                You have no friend.
                            </div>)
                            : (<>
                                <div className="flex justify-between items-center mb-2">
                                    {loading ? (
                                        <div className="flex items-center space-x-2">
                                            <Skeleton className="h-10 w-10 bg-neutral-200 rounded-full" />
                                            <Skeleton className="h-5 w-40 bg-neutral-200 rounded" />
                                        </div>
                                    ) : (
                                        <div className="flex items-center space-x-2">
                                            <Image
                                                src={activeParticipant?.image || ""}
                                                alt="User Avatar"
                                                width={32}
                                                height={32}
                                                className="rounded-full"
                                            />
                                            <span className="font-semibold text-gray-700">{activeParticipant?.username}</span>
                                        </div>
                                    )}

                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <button
                                                    onClick={() => setDialogOpen(true)}
                                                    className="p-1 rounded-full hover:bg-gray-100"
                                                >
                                                    <Plus className="w-5 h-5" />
                                                </button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Chat with Friend</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>

                                <div className="flex flex-col justify-end h-80">
                                    <ChatBox />
                                </div>
                            </>)
                    }
                </PopoverContent>
            </Popover>

            <NewMessageDialog open={dialogOpen} onOpenChange={setDialogOpen} />
        </>
    );
}
