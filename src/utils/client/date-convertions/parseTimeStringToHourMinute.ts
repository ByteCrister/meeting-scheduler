export default function parseTimeStringToHourMinute(timeStr: string) {
    const [time, meridiem] = timeStr.trim().split(" ");
    const [hourStr, minuteStr] = time.split(":");

    let hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);

    if (meridiem.toUpperCase() === "PM" && hour !== 12) hour += 12;
    if (meridiem.toUpperCase() === "AM" && hour === 12) hour = 0;

    return { hour, minute };
}