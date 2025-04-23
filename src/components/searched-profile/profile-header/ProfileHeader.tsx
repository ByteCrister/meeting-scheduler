'use client';

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Clock, Briefcase } from "lucide-react";
import { SearchedUserProfile } from '../profile/SearchedProfile';


export const ProfileHeader = ({ profile }: { profile: SearchedUserProfile }) => {
  const usernameFallback = profile.username ? profile.username.slice(0, 2).toUpperCase() : "??"; // Fallback to "??" if username is undefined

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
      </div>
    </Card>
  );
}; 