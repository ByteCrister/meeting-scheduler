'use client';

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import React from "react";

interface SearchBarProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const SearchBar = ({ value, onChange }: SearchBarProps) => {
  return (
    <div className="relative w-full group">
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
      </div>

      <Input
        type="text"
        placeholder="Search meetings..."
        value={value}
        onChange={onChange}
        className="pl-10 pr-10 h-10 rounded-md border border-input bg-background
                   focus:outline-none focus:ring-[1.5px] focus:ring-muted 
                   focus:ring-offset-[1px] focus:ring-offset-background transition-all"
      />

      {value && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0 h-10 w-10 text-muted-foreground hover:bg-transparent hover:text-muted-foreground"
          // onClick={handleClear}
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </Button>
      )}

    </div>
  );
};
