export default function parseTimeStringToHourMinute(timeStr: string) {
    if (!timeStr || typeof timeStr !== "string") {
        throw new Error(`Invalid time string: ${timeStr}`);
    }

    const trimmed = timeStr.trim();

    // 24-hour format: "21:11"
    if (/^\d{1,2}:\d{2}$/.test(trimmed)) {
        const [hourStr, minuteStr] = trimmed.split(":");
        const hour = parseInt(hourStr, 10);
        const minute = parseInt(minuteStr, 10);

        if (isNaN(hour) || isNaN(minute)) {
            throw new Error(`Invalid 24-hour time: ${timeStr}`);
        }

        return { hour, minute };
    }

    // 12-hour format: "09:30 PM"
    const [time, meridiemRaw] = trimmed.split(" ");
    if (!time || !meridiemRaw) {
        throw new Error(`Invalid 12-hour time format: ${timeStr}`);
    }

    const meridiem = meridiemRaw.toUpperCase();
    const [hourStr, minuteStr] = time.split(":");

    let hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);

    if (isNaN(hour) || isNaN(minute)) {
        throw new Error(`Invalid hour or minute in time: ${timeStr}`);
    }

    if (meridiem === "PM" && hour !== 12) hour += 12;
    if (meridiem === "AM" && hour === 12) hour = 0;

    return { hour, minute };
}
