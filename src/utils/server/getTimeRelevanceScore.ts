function getTimeRelevanceScore(meetingDate: string | undefined): number {
    if (!meetingDate) return 0;

    const now = new Date();
    const meeting = new Date(meetingDate);
    const diffDays = (meeting.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

    // Closer meetings are more relevant (score drops after 7 days)
    if (diffDays < 0) return 0;                  // Past or invalid
    if (diffDays <= 1) return 1;                 // Today or tomorrow
    if (diffDays <= 3) return 0.8;
    if (diffDays <= 7) return 0.5;
    if (diffDays <= 14) return 0.2;
    return 0.1;                                   // Far future is less trending
}


export default getTimeRelevanceScore;