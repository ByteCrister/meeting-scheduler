export const getDuration = (from: string, to: string) => {
    const convertTo24Hour = (time: string) => {
        const match = time.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (!match) return { hours: 0, minutes: 0 };

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [_, hour, min, period] = match;
        let h = parseInt(hour);
        const m = parseInt(min);

        if (period.toUpperCase() === 'PM' && h !== 12) h += 12;
        if (period.toUpperCase() === 'AM' && h === 12) h = 0;

        return { hours: h, minutes: m };
    };

    const fromTime = convertTo24Hour(from);
    const toTime = convertTo24Hour(to);

    const fromDate = new Date(0, 0, 0, fromTime.hours, fromTime.minutes);
    const toDate = new Date(0, 0, 0, toTime.hours, toTime.minutes);

    let diff = (toDate.getTime() - fromDate.getTime()) / (1000 * 60); // in minutes
    if (diff < 0) diff += 24 * 60; // handle overnight ranges

    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;

    let result = '';
    if (hours > 0) result += `${hours} hour${hours !== 1 ? 's' : ''}`;
    if (minutes > 0) {
        if (result) result += ' ';
        result += `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }

    return result || '0 minutes';
};