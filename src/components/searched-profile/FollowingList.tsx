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
import ListSkeleton from "./ListSkeleton";
import {
  followFriend,
  removeFriend,
  unfollowFriend,
} from "@/utils/client/api/api-friendZone";
import LoadingSpinner from "../global-ui/ui-component/LoadingSpinner";
import PaginateButtons from "../global-ui/ui-component/PaginateButtons";

interface Follower {
  _id: string;
  username: string;
  image: string;
  title: string;
  description: string;
  isFollowing: boolean;
  isFollower: boolean;
}

interface FollowingListProp {
  userId: string;
}

// ? API's
const ApiOperations = {
  follow: async (userId: string) => await followFriend(userId),
  unfollow: async (userId: string) => await unfollowFriend(userId),
  remove: async (userId: string) => await removeFriend(userId),
};

const dummyFollowers: Follower[] = [
  {
    _id: "1",
    username: "johndoe",
    image: "https://i.pravatar.cc/150?img=3",
    title: "Senior Developer",
    description: "Full-stack engineer specializing in React and Node.js",
    isFollower: true,
    isFollowing: true,
  },
  {
    _id: "2",
    username: "janedoe",
    image: "https://i.pravatar.cc/150?img=5",
    title: "UX Lead",
    description: "Designing delightful experiences at a fintech startup",
    isFollower: true,
    isFollowing: false,
  },
  {
    _id: "3",
    username: "michaelb",
    image: "https://i.pravatar.cc/150?img=10",
    title: "Data Analyst",
    description: "Turning numbers into insights at HealthTech Inc.",
    isFollower: false,
    isFollowing: true,
  },
  {
    _id: "4",
    username: "chloesmith",
    image: "https://i.pravatar.cc/150?img=15",
    title: "Cloud Infrastructure Engineer",
    description: "Automating deployments and building scalable systems",
    isFollower: true,
    isFollowing: true,
  },
  {
    _id: "5",
    username: "khalidtech",
    image: "https://i.pravatar.cc/150?img=20",
    title: "Mobile App Developer",
    description: "Building smooth mobile experiences with Flutter",
    isFollower: false,
    isFollowing: false,
  },
];

export const FollowingList: React.FC<FollowingListProp> = ({ userId }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [loadingBtns, setLoadingBtns] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [confirmAction, setConfirmAction] = useState<{
    follower: Follower;
    operation: "remove" | "unfollow";
  } | null>(null);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [maxItem] = useState<number>(3);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const response = await getSearchedUser(
        userId || "",
        ApiSPType.GET_USER_FOLLOWERS
      );
      const { data, success } = response.data as {
        data: Follower[];
        success: boolean;
      };
      if (success) {
        if (data.length === 0) setFollowers(dummyFollowers);
        else setFollowers(data);
      }
      setIsLoading(false);
    };

    fetchData();
  }, [userId]);

  if (isLoading) return <ListSkeleton />;

  if (followers.length === 0) {
    return (
      <div className="w-full text-center py-6 text-muted-foreground text-sm italic">
        User has no followers yet.
      </div>
    );
  }

  const handleLoadingBtns = (
    followerId: string,
    operation: "add" | "delete"
  ) => {
    if (operation === "add") {
      setLoadingBtns((prev) => ({ ...prev, [followerId]: true }));
    } else {
      setLoadingBtns((prev) => {
        const updated = { ...prev };
        delete updated[followerId];
        return updated;
      });
    }
  };

  const handleButtonClick = async (
    api: "follow" | "unfollow" | "remove",
    followerId: string,
    filedValue: boolean
  ) => {
    handleLoadingBtns(followerId, "add");
    const response = await ApiOperations[api](followerId);
    if (response.success) {
      const toggleField =
        api === "follow" || api === "unfollow" ? "isFollowing" : "isFollower";
      setFollowers((prev) =>
        prev.map((item) =>
          item._id === followerId
            ? { ...item, [toggleField]: !filedValue }
            : item
        )
      );
    }
    handleLoadingBtns(followerId, "delete");
  };

  return (
    <>
      <div className="space-y-4">
        {followers
          .slice(
            maxItem * (currentPage - 1),
            maxItem * (currentPage - 1) + maxItem
          )
          .map((follower, index) => (
            <motion.div
              key={follower._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="p-5 bg-background/80 hover:bg-background/90 transition-colors border border-border shadow hover:shadow-xl backdrop-blur-xl rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-14 w-14 border-2 border-primary/30 shadow-inner">
                      <AvatarImage
                        src={follower.image}
                        alt={follower.username}
                      />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {follower.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-bold tracking-tight text-foreground">
                        {follower.username}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {follower.title}
                      </p>
                      <p className="text-xs text-gray-400 italic">
                        {follower.description}
                      </p>
                    </div>
                  </div>

                  <Button
                    id={`follower-${follower._id}`}
                    size="sm"
                    className={cn(
                      "group px-4 py-2 text-sm font-medium rounded-md flex items-center gap-2 transition-all duration-300",
                      follower.isFollowing
                        ? "border-muted text-muted-foreground bg-gray-50 hover:bg-destructive/10 hover:text-destructive"
                        : "bg-primary text-white hover:bg-primary/90 shadow-sm"
                    )}
                    // ? If user's follower is my follower then return 'remove', if I follow to the user's follower then unFollow else follow
                    onClick={() => {
                      const operation = follower.isFollower
                        ? "remove"
                        : follower.isFollowing
                          ? "unfollow"
                          : "follow";
                      const filedValue =
                        operation === "remove"
                          ? follower.isFollower
                          : follower.isFollowing;

                      if (operation === "unfollow" || operation === "remove") {
                        setConfirmAction({ follower, operation });
                      } else {
                        handleButtonClick(operation, follower._id, filedValue);
                      }
                    }}
                  >
                    {loadingBtns[follower._id] && loadingBtns[follower._id] ? (
                      <LoadingSpinner />
                    ) : follower.isFollowing ? (
                      <>
                        <UserMinus className="h-4 w-4 text-destructive group-hover:scale-110 transition-transform" />
                        Unfollow
                      </>
                    ) : follower.isFollower ? (
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
              </Card>
            </motion.div>
          ))}
      </div>

      <PaginateButtons
        currentPage={currentPage}
        maxItems={maxItem}
        totalItems={followers.length}
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
              <strong>{confirmAction.follower.username}</strong>?
            </p>

            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setConfirmAction(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  const { follower, operation } = confirmAction;
                  setConfirmAction(null);
                  await handleButtonClick(
                    operation,
                    follower._id,
                    operation === "remove"
                      ? follower.isFollower
                      : follower.isFollowing
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
