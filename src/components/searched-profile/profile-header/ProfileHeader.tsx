'use client';

import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Clock, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button"; // Assuming you have a Button component
import { SearchedUserProfile } from '../profile/SearchedProfile';
import LoadingSpinner from '@/components/global-ui/ui-component/LoadingSpinner';
import { followFriend, unfollowFriend } from '@/utils/client/api/api-friendZone';
import ShowToaster from '@/components/global-ui/toastify-toaster/show-toaster';

export const ProfileHeader = ({ profile }: { profile: SearchedUserProfile }) => {
  const [isFollowing, setIsFollowing] = useState(profile.isFollowing);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const usernameFallback = profile.username ? profile.username.slice(0, 2).toUpperCase() : "??";

  const handleFollowToggle = async () => {
    setIsLoading(true);
    const responseData = profile.isFollowing ? await unfollowFriend(profile._id) : await followFriend(profile._id);
    console.log(responseData);
    if (responseData.success) {
      setIsFollowing(prev => !prev);
      ShowToaster(responseData.message, 'success');
    }
    setIsLoading(false);
  };

  return (
    <Card className="p-6 shadow">
      <div className="flex flex-col items-center text-center space-y-4">
        <Avatar className="h-32 w-32 border-4 border-background">
          <AvatarImage src={profile.image} alt={profile.username} />
          <AvatarFallback>{usernameFallback}</AvatarFallback>
        </Avatar>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{profile.username}</h1>
          <p className="text-xl text-muted-foreground">{profile.title}</p>
        </div>

        <div className="flex items-center space-x-6 text-sm text-muted-foreground">
          <div className="flex items-center">
            <Briefcase className="mr-2 h-4 w-4" />
            <span>{profile.profession}</span>
          </div>
          <div className="flex items-center">
            <Clock className="mr-2 h-4 w-4" />
            <span>{profile.timezone}</span>
          </div>
        </div>

        {
          isLoading
            ? <LoadingSpinner />
            : <Button onClick={handleFollowToggle} className="mt-4 bg-gray-700">
              {isFollowing ? 'Unfollow' : 'Follow'}
            </Button>
        }

      </div>
    </Card>
  );
};
