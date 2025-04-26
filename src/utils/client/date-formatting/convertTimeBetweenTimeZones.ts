import { DateTime } from "luxon";

/**
 * Converts a given date and time from one UTC offset timezone to another.
 * 
 * @param fromTimeZone - Source timezone in format "UTC+06:00"
 * @param toTimeZone - Target timezone in format "UTC+02:00"
 * @param dateStr - ISO date string (only date part used)
 * @param timeStr - Time string (like "02:00 PM")
 * @returns Converted DateTime object
 */
export function convertTimeBetweenTimeZones(
  fromTimeZone: string,
  toTimeZone: string,
  dateStr: string,
  timeStr: string
) {
  if (!dateStr || !timeStr) {
    return '';
  }
  if (fromTimeZone === toTimeZone) {
    return timeStr;
  }
  // Extract the date part
  const datePart = dateStr.slice(0, 10); // "YYYY-MM-DD"

  // Combine date and time
  const combinedDateTime = `${datePart} ${timeStr}`;

  // First try 24-hour parsing
  let sourceDateTime = DateTime.fromFormat(combinedDateTime, "yyyy-MM-dd HH:mm", {
    zone: normalizeUtcOffset(fromTimeZone),
  });

  // If failed, try 12-hour (AM/PM) parsing
  if (!sourceDateTime.isValid) {
    sourceDateTime = DateTime.fromFormat(combinedDateTime, "yyyy-MM-dd hh:mm a", {
      zone: normalizeUtcOffset(fromTimeZone),
    });
  }

  if (!sourceDateTime.isValid) {
    console.error(sourceDateTime.invalidExplanation);
    throw new Error("Invalid source date-time parsing.");
  }

  // Convert to target timezone
  const targetDateTime = sourceDateTime.setZone(normalizeUtcOffset(toTimeZone));

  // Return only the time part
  return targetDateTime.toFormat("hh:mm a");
}

/**
 * Normalizes "UTC+06:00" to a format luxon understands ("UTC+6" or "UTC-5")
 */
function normalizeUtcOffset(offset: string): string {
  // luxon can work with "UTC+6", but sometimes users give "UTC+06:00"
  return offset.replace(":00", "").replace("UTC", "UTC");
}