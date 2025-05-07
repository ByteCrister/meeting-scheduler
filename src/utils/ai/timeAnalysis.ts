// * src>utils>ai>timeAnalysis.ts
"use server"

import { TimeDataSlot } from "@/app/api/ai-insights/best-time/route";

const parseTime = (timeStr: string) => {
    if (!timeStr) {
        throw new Error(`Invalid time string: ${timeStr}`);
    }

    // Assuming time format is something like "03:00 PM"
    const [time, modifier] = timeStr.split(" ");
    if (!time || !modifier) {
        throw new Error(`Invalid time format: ${timeStr}`);
    }

    // eslint-disable-next-line prefer-const
    let [hours, minutes] = time.split(":").map(Number);

    if (modifier === "PM" && hours !== 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;

    return new Date(1970, 0, 1, hours, minutes);  // Use a dummy date, only time matters
};

export const analyzeBestTimes = async (slots: TimeDataSlot[]) => {
    const days: Record<string, { engagementRates: number[], durations: number[], date: Date }> = {};

    slots.forEach(slot => {
        const date = new Date(slot.meetingDate);
        const day = date.toLocaleString('en-US', { weekday: 'long' });

        if (!days[day]) {
            days[day] = { engagementRates: [], durations: [], date };
        }

        if (slot.durationFrom && slot.durationTo) {
            try {
                const startTime = parseTime(slot.durationFrom);
                const endTime = parseTime(slot.durationTo);
                const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60);  // Convert ms to minutes

                days[day].engagementRates.push(slot.engagementRate);
                days[day].durations.push(duration || 0);
            } catch (error) {
                console.error("Error parsing time:", error);
            }
        } else {
            console.warn("Invalid time data for slot:", slot);
        }
    });

    return Object.entries(days).map(([day, { engagementRates, durations, date }]) => ({
        day,
        date,
        avgEngagement: engagementRates.reduce((a, b) => a + b, 0) / engagementRates.length,
        totalMeetings: engagementRates.length,
        avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
    })).sort((a, b) => b.avgEngagement - a.avgEngagement);
};
