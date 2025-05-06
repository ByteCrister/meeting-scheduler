"use client";

import React, { useState, useEffect } from "react";
import { MeetingCard } from "./MeetingCard";
import { MeetingCardSkeleton } from "./MeetingCardSkeleton";
import { SearchBar } from "./SearchBar";
import { SortOptions } from "./SortOptions";
import { FilterOptions } from "./FilterOptions";
import apiService from "@/utils/client/api/api-services";
import { PopularMeeting, RegisterSlotStatus } from "@/types/client-types";
import usePopularSearch from "@/hooks/usePopularSearch";

const formattedData: PopularMeeting[] = [
  {
    _id: "66452f1a3c8a4d2f9b21d100",
    title: "Intro to Web Development",
    meetingDate: "2025-05-10T10:00:00Z",
    guestSize: 50,
    totalParticipants: 35,
    engagementRate: 0.82,
    category: "Web",
    status: RegisterSlotStatus.Upcoming,
    description:
      "A beginner-friendly session on the basics of web development.",
    tags: ["html", "css", "javascript"],
    durationFrom: "10:00 AM",
    durationTo: "11:30 AM",
  },
  {
    _id: "66452f1a3c8a4d2f9b21d101",
    title: "AI Trends in 2025",
    meetingDate: "2025-05-12T14:00:00Z",
    guestSize: 100,
    totalParticipants: 95,
    engagementRate: 0.95,
    category: "AI",
    status: RegisterSlotStatus.Ongoing,
    description: "Explore the latest trends and use cases in AI.",
    tags: ["AI", "machine learning", "trends"],
    durationFrom: "2:00 PM",
    durationTo: "4:00 PM",
  },
  {
    _id: "66452f1a3c8a4d2f9b21d102",
    title: "Effective Team Communication",
    meetingDate: "2025-05-08T09:30:00Z",
    guestSize: 30,
    totalParticipants: 30,
    engagementRate: 1.0,
    category: "Soft Skills",
    status: RegisterSlotStatus.Completed,
    description: "Learn techniques to improve your team communication.",
    tags: ["communication", "teamwork", "soft skills"],
    durationFrom: "9:30 AM",
    durationTo: "10:30 AM",
  },
  {
    _id: "66452f1a3c8a4d2f9b21d103",
    title: "Design Thinking Workshop",
    meetingDate: "2025-05-15T16:00:00Z",
    guestSize: 20,
    totalParticipants: 12,
    engagementRate: 0.6,
    category: "Design",
    status: RegisterSlotStatus.Upcoming,
    description: "A hands-on workshop to learn design thinking methodology.",
    tags: ["design", "thinking", "workshop"],
    durationFrom: "4:00 PM",
    durationTo: "6:00 PM",
  },
  {
    _id: "66452f1a3c8a4d2f9b21d104",
    title: "Career Planning for Developers",
    meetingDate: "2025-05-18T13:00:00Z",
    guestSize: 40,
    totalParticipants: 27,
    engagementRate: 0.68,
    category: "Career",
    status: RegisterSlotStatus.Upcoming,
    description:
      "Strategies and tips for planning a long-term development career.",
    tags: ["career", "development", "strategy"],
    durationFrom: "1:00 PM",
    durationTo: "2:30 PM",
  },
];

export const PopularPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [Store, setStore] = useState<{ Store: PopularMeeting[]; meetings: PopularMeeting[] }>({ Store: [], meetings: [] });
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "popularity" | "engagement">(
    "date"
  );
  const [selectedCategory, setSelectedCategory] = useState<string>("category");
  const [categories, setCategories] = useState<string[]>(["category"]);
  const popularSearch = usePopularSearch(Store, setStore);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const resData = await apiService.get(`/api/popular`);
      if (resData?.success && resData?.data?.length !== 0) {
        setStore({ Store: resData.data, meetings: resData.data });
        setCategories(prev => [...prev, ...resData.categories]);
      } else {
        setStore({ Store: formattedData, meetings: formattedData });
        setCategories(prev => [...prev, ...["Web", "AI", "Soft Skills", "Design", "Career"]]);
      }
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const filteredMeetings = Store.meetings
    .filter((meeting) =>
      selectedCategory === "category" || meeting.category === selectedCategory
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "date":
          return (
            new Date(b.meetingDate).getTime() -
            new Date(a.meetingDate).getTime()
          );
        case "popularity":
          return b.totalParticipants - a.totalParticipants;
        case "engagement":
          return b.engagementRate - a.engagementRate;
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Popular Meetings
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Discover and join the most engaging meetings in your organization
            </p>
          </div>
        </div>

        <div className="dark:bg-muted p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-2">
            <SearchBar
              value={searchQuery}
              onChange={(value: string) => { setSearchQuery(value); popularSearch(value); }}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 items-center justify-between">
              <SortOptions
                value={sortBy}
                onChange={(value) => setSortBy(value)}
              />
              <FilterOptions
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <MeetingCardSkeleton key={index} />
            ))
          ) : filteredMeetings.length > 0 ? (
            filteredMeetings.map((meeting) => (
              <MeetingCard key={meeting._id} meeting={meeting} />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <svg
                  className="h-full w-full"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No meetings found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
