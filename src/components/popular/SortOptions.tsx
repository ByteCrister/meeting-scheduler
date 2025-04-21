'use client';

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Calendar, Users, TrendingUp } from "lucide-react";
import React from "react";

interface SortOptionsProps {
  value: 'date' | 'popularity' | 'engagement';
  onChange: (value: 'date' | 'popularity' | 'engagement') => void;
}

export const SortOptions: React.FC<SortOptionsProps> = ({ value, onChange }) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm shadow-sm transition duration-150 focus:outline-none focus:border-ring focus:ring-2 focus:ring-muted focus:ring-offset-[2px] focus:ring-offset-background"
      >
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="date">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Date
          </div>
        </SelectItem>
        <SelectItem value="popularity">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Popularity
          </div>
        </SelectItem>
        <SelectItem value="engagement">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Engagement
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
};
