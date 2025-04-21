export function formatUtcToLocalTime(utcStr: string, timeZoneOffset: string): string {
    if (!utcStr || !timeZoneOffset) return "Invalid Time";  // Catch invalid inputs

    const offsetMatch = timeZoneOffset.match(/UTC([+-])(\d{2}):(\d{2})/);
    if (!offsetMatch) return "Invalid Time";  // Handle bad UTC format

    const [, sign, hours, minutes] = offsetMatch;
    const offsetMinutes = parseInt(hours) * 60 + parseInt(minutes);
    const offsetInMinutes = sign === "+" ? offsetMinutes : -offsetMinutes;

    const date = new Date(utcStr);
    if (isNaN(date.getTime())) return "Invalid Time";  // Catch invalid date conversion

    const localDate = new Date(date.getTime() + offsetInMinutes * 60_000);

    return localDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
}