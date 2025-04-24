export function formatUTCDateToOffset(utcDateStr: string, offsetStr: string): string {
    const utcDate = new Date(utcDateStr);

    // Clean up and normalize the offset string
    let cleanedOffset = offsetStr.trim();

    // Fix missing "+" if it's in format like "UTC 06:00" or "06:00"
    if (/^UTC\s?\d{2}:\d{2}$/.test(cleanedOffset)) {
        cleanedOffset = cleanedOffset.replace(/^UTC\s?/, 'UTC+');
    } else if (/^\d{2}:\d{2}$/.test(cleanedOffset)) {
        cleanedOffset = 'UTC+' + cleanedOffset;
    }

    // Make sure it matches "UTC±HH:MM"
    const offsetRegex = /^UTC([+-])(\d{2}):(\d{2})$/;
    const match = cleanedOffset.match(offsetRegex);

    if (!match) {
        console.error('Invalid time zone offset format received:', offsetStr);
        throw new Error("Invalid offset format. Expected format: 'UTC+HH:MM'");
    }

    const sign = match[1] === '+' ? 1 : -1;
    const hours = parseInt(match[2], 10);
    const minutes = parseInt(match[3], 10);

    const totalOffsetMinutes = sign * (hours * 60 + minutes);
    const localTime = new Date(utcDate.getTime() + totalOffsetMinutes * 60000);

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
