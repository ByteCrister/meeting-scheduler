export function formatUTCDateToOffset(utcDateStr: string, offsetStr: string): string {
    // Create a Date object from the UTC string.
    const utcDate = new Date(utcDateStr);

    // Validate and extract information from the offset string.
    // Expected format: "UTC+06:00" or "UTC-05:30", etc.
    const offsetRegex = /^UTC([+-])(\d{2}):(\d{2})$/;
    const match = offsetStr.match(offsetRegex);

    if (!match) {
        throw new Error("Invalid offset format. Expected format: 'UTC+HH:MM'");
    }

    const sign = match[1] === '+' ? 1 : -1;
    const hours = parseInt(match[2], 10);
    const minutes = parseInt(match[3], 10);

    // Calculate the total offset in minutes.
    const totalOffsetMinutes = sign * (hours * 60 + minutes);

    // Adjust the UTC time by the offset.
    // Date.getTime() returns milliseconds, so multiply minutes by 60000.
    const localTime = new Date(utcDate.getTime() + totalOffsetMinutes * 60000);

    // Format the resulting date. We use 'UTC' as the timeZone here because we've already applied the offset.
    return localTime.toLocaleString("en-US", {
        timeZone: "UTC",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
}