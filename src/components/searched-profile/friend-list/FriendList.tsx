"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserPlus, UserMinus, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { getSearchedUser } from "@/utils/client/api/api-searched-profile";
import { ApiSPType } from "@/utils/constants";
import {
  followFriend,
  removeFriend,
  unfollowFriend,
} from "@/utils/client/api/api-friendZone";
import ListSkeleton from "./ListSkeleton";
import LoadingSpinner from "@/components/global-ui/ui-component/LoadingSpinner";
import PaginateButtons from "@/components/global-ui/ui-component/PaginateButtons";
import Link from "next/link";
import { useAppSelector } from "@/lib/hooks";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";


interface FriendList {
  _id: string;
  username: string;
  image: string;
  title: string;
  description: string;
  isFollowing: boolean;
  isFollower: boolean;
}

interface FollowersListProps {
  userId: string;
  type: 'follower' | 'following'
}

// ? API's
const ApiOperations = {
  follow: async (userId: string) => await followFriend(userId),
  unfollow: async (userId: string) => await unfollowFriend(userId),
  remove: async (userId: string) => await removeFriend(userId),
};

// const dummyFollowers: FriendList[] = [
//   {
//     _id: "1",
//     username: "johndoe",
//     image: "https://i.pravatar.cc/150?img=3",
//     title: "Senior Developer",
//     description: "Full-stack engineer specializing in React and Node.js",
//     isFollower: true,
//     isFollowing: true,
//   },
//   {
//     _id: "2",
//     username: "janedoe",
//     image: "https://i.pravatar.cc/150?img=5",
//     title: "UX Lead",
//     description: "Designing delightful experiences at a fintech startup",
//     isFollower: true,
//     isFollowing: false,
//   },
//   {
//     _id: "3",
//     username: "michaelb",
//     image: "https://i.pravatar.cc/150?img=10",
//     title: "Data Analyst",
//     description: "Turning numbers into insights at HealthTech Inc.",
//     isFollower: false,
//     isFollowing: true,
//   },
//   {
//     _id: "4",
//     username: "chloesmith",
//     image: "https://i.pravatar.cc/150?img=15",
//     title: "Cloud Infrastructure Engineer",
//     description: "Automating deployments and building scalable systems",
//     isFollower: true,
//     isFollowing: true,
//   },
//   {
//     _id: "5",
//     username: "khalidtech",
//     image: "https://i.pravatar.cc/150?img=20",
//     title: "Mobile App Developer",
//     description: "Building smooth mobile experiences with Flutter",
//     isFollower: false,
//     isFollowing: false,
//   },
// ];

export const FriendList: React.FC<FollowersListProps> = ({ userId, type }) => {
  const currentUserId = useAppSelector(state => state.userStore.user?._id);
  const [isLoading, setIsLoading] = useState(true);
  const [friendList, setFollowers] = useState<FriendList[]>([]);
  const [loadingBtns, setLoadingBtns] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [confirmAction, setConfirmAction] = useState<{
    friend: FriendList;
    operation: "remove" | "unfollow";
  } | null>(null);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const maxItem = 3;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      const apiType = type === 'follower' ? ApiSPType.GET_USER_FOLLOWERS : ApiSPType.GET_USER_FOLLOWINGS

      const response = await getSearchedUser(userId || "", apiType);
      const { data, success } = response as {
        data: FriendList[];
        success: boolean;
      };
      if (success) {
        console.log(data);
        setFollowers(data);
      }
      setIsLoading(false);
    };

    fetchData();
  }, [type, userId]);

  if (isLoading) return <ListSkeleton />;

  if (friendList.length === 0) {
    return (
      <div className="w-full text-center py-6 text-muted-foreground text-sm italic">
        User has no followers yet.
      </div>
    );
  }

  const handleLoadingBtns = (
    friendId: string,
    operation: "add" | "delete"
  ) => {
    if (operation === "add") {
      setLoadingBtns((prev) => ({ ...prev, [friendId]: true }));
    } else {
      setLoadingBtns((prev) => {
        const updated = { ...prev };
        delete updated[friendId];
        return updated;
      });
    }
  };

  const handleButtonClick = async (
    api: "follow" | "unfollow" | "remove",
    friendId: string,
    filedValue: boolean
  ) => {
    handleLoadingBtns(friendId, "add");
    const response = await ApiOperations[api](friendId);
    if (response.success) {
      const toggleField =
        api === "follow" || api === "unfollow" ? "isFollowing" : "isFollower";
      setFollowers((prev) =>
        prev.map((item) =>
          item._id === friendId
            ? { ...item, [toggleField]: !filedValue }
            : item
        )
      );
    }
    handleLoadingBtns(friendId, "delete");
  };

  return (
    <>
      <div className="space-y-4">
        {friendList
          .slice(
            maxItem * (currentPage - 1),
            maxItem * (currentPage - 1) + maxItem
          )
          .map((friend, index) => (
            <motion.div
              key={friend._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="p-5 bg-background/80 hover:bg-background/90 transition-colors border border-border shadow hover:shadow-xl backdrop-blur-xl rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-14 w-14 border-2 border-primary/30 shadow-inner">
                      <AvatarImage
                        src={friend.image}
                        alt={friend.username}
                      />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {friend.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Link href={`/searched-profile?user=${friend._id}`}>
                        <h3 className="text-lg font-bold tracking-tight text-foreground hover:underline">
                          {friend.username}
                        </h3>
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {friend.title}
                      </p>
                      <p className="text-xs text-gray-400 italic">
                        {friend.description}
                      </p>
                    </div>
                  </div>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="inline-block">
                        <Button
                          id={`friend-${friend._id}`}
                          size="sm"
                          disabled={currentUserId === friend._id}
                          className={cn(
                            "group px-4 py-2 text-sm font-medium rounded-md flex items-center gap-2 transition-all duration-300",
                            friend.isFollowing
                              ? "border-muted text-muted-foreground bg-gray-50 hover:bg-destructive/10 hover:text-destructive"
                              : "bg-primary text-white hover:bg-primary/90 shadow-sm"
                          )}
                          onClick={() => {
                            const operation = friend.isFollower
                              ? "remove"
                              : friend.isFollowing
                                ? "unfollow"
                                : "follow";
                            const filedValue =
                              operation === "remove"
                                ? friend.isFollower
                                : friend.isFollowing;

                            if (currentUserId === friend._id) return;

                            if (operation === "unfollow" || operation === "remove") {
                              setConfirmAction({ friend: friend, operation });
                            } else {
                              handleButtonClick(operation, friend._id, filedValue);
                            }
                          }}
                        >
                          {loadingBtns[friend._id] ? (
                            <LoadingSpinner />
                          ) : friend.isFollowing ? (
                            <>
                              <UserMinus className="h-4 w-4 text-destructive group-hover:scale-110 transition-transform" />
                              Unfollow
                            </>
                          ) : friend.isFollower ? (
                            <>
                              <UserPlus className="h-4 w-4 group-hover:scale-110 transition-transform" />
                              <span className="tracking-tight">Remove</span>
                            </>
                          ) : (
                            <>
                              <UserPlus className="h-4 w-4 group-hover:scale-110 transition-transform" />
                              <span className="tracking-tight">Follow</span>
                            </>
                          )}
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform duration-200" />
                        </Button>
                      </div>
                    </TooltipTrigger>

                    {currentUserId === friend._id && (
                      <TooltipContent className="text-xs text-muted-foreground bg-white shadow-lg border px-2 py-1 rounded-md">
                        You can&apos;t follow yourself!
                      </TooltipContent>
                    )}
                  </Tooltip>

                </div>
              </Card>
            </motion.div>
          ))}
      </div>

      <PaginateButtons
        currentPage={currentPage}
        maxItems={maxItem}
        totalItems={friendList.length}
        handlePaginatePage={(newPage) => setCurrentPage(newPage)}
      />

      {/* Confirmation Dialog */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="w-full max-w-sm p-6 space-y-4 border border-border shadow-xl bg-background">
            <h2 className="text-lg font-semibold text-center">
              {confirmAction.operation === "remove"
                ? "Remove Follower"
                : "Unfollow User"}
            </h2>
            <p className="text-sm text-muted-foreground text-center">
              Are you sure you want to {confirmAction.operation}{" "}
              <strong>{confirmAction.friend.username}</strong>?
            </p>

            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setConfirmAction(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  const { friend, operation } = confirmAction;
                  setConfirmAction(null);
                  await handleButtonClick(
                    operation,
                    friend._id,
                    operation === "remove"
                      ? friend.isFollower
                      : friend.isFollowing
                  );
                }}
              >
                Confirm
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
};
