import { DateTime } from "luxon";

/**
 * Converts a given date and time from one UTC offset timezone to another,
 * and returns both the converted date and time separately.
 * 
 * @param fromTimeZone - Source timezone in format "UTC+06:00"
 * @param toTimeZone - Target timezone in format "UTC+02:00"
 * @param dateStr - ISO date string (only date part used)
 * @param timeStr - Time string (like "02:00 PM")
 * @returns An object containing converted date (yyyy-MM-dd) and time (hh:mm a)
 */
export function convertDateTimeBetweenTimeZones(
  fromTimeZone: string,
  toTimeZone: string,
  dateStr: string,
  timeStr: string
): string {
  // Step 1: Extract the date part
  const datePart = dateStr.slice(0, 10); // "YYYY-MM-DD"

  if (fromTimeZone === toTimeZone) {
    const dateOnly = DateTime.fromISO(dateStr.slice(0, 10));
    return dateOnly.toFormat("MMM d, yyyy");
  }

  // Step 2: Combine date and time
  const combinedDateTime = `${datePart} ${timeStr}`;

  // Step 3: Parse in source timezone
  const sourceDateTime = DateTime.fromFormat(combinedDateTime, "yyyy-MM-dd hh:mm a", {
    zone: normalizeUtcOffset(fromTimeZone),
  });

  if (!sourceDateTime.isValid) {
    throw new Error("Invalid source date-time parsing.");
  }

  // Step 4: Convert to target timezone
  const targetDateTime = sourceDateTime.setZone(normalizeUtcOffset(toTimeZone));

  // Step 5: Return date
  return targetDateTime.toFormat("yyyy-MM-dd");
}

/**
 * Normalizes "UTC+06:00" to a format luxon understands ("UTC+6" or "UTC-5")
 */
function normalizeUtcOffset(offset: string): string {
  return offset.replace(":00", "").replace("UTC", "UTC");
}