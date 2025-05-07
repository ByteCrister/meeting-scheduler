import { registerSlot } from "@/types/client-types";
import getTimeRelevanceScore from "./getTimeRelevanceScore";

function calculateTrendScore(slot: registerSlot): number {
    const fillRate = slot.guestSize > 0 ? slot.bookedUsers.length / slot.guestSize : 0;
    const timeScore = getTimeRelevanceScore(slot.meetingDate);

    const trendScore = (fillRate * 40) + (slot.engagementRate * 30) + (timeScore * 30);
    return Math.round(trendScore * 100) / 100; // rounded to 2 decimal places
}

export default calculateTrendScore;