import parseTimeStringToHourMinute from "./parseTimeStringToHourMinute";

export function convertToUtcISOString(
    baseDateStr: string,
    timeStr: string,
    utcOffsetStr: string
): string {
    const { hour, minute } = parseTimeStringToHourMinute(timeStr);

    // Parse UTC offset like "UTC+06:00"
    const match = utcOffsetStr.match(/UTC([+-])(\d{2}):(\d{2})/);
    if (!match) throw new Error("Invalid UTC offset format");

    const [, sign, offsetHour, offsetMinute] = match;
    const totalOffsetMins =
        (parseInt(offsetHour, 10) * 60 + parseInt(offsetMinute, 10)) *
        (sign === "+" ? 1 : -1);

    const baseDate = new Date(baseDateStr); // From MongoDB, in UTC

    // Create local date based on time in their timezone
    const localDate = new Date(
        Date.UTC(
            baseDate.getUTCFullYear(),
            baseDate.getUTCMonth(),
            baseDate.getUTCDate(),
            hour,
            minute
        )
    );
    // Convert to UTC by subtracting the offset
    const utcDate = new Date(localDate.getTime() - totalOffsetMins * 60_000);
    return utcDate.toISOString();
}