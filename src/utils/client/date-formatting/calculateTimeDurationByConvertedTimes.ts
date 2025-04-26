import { convertTimeBetweenTimeZones } from "./convertTimeBetweenTimeZones";
import { getDuration } from "./getTimeDuration";

/**
 * Calculates the full duration of a meeting after converting start and end times
 * based on the user's timezone.
 * 
 * @param currentTimeZone - The original timezone of the meeting (e.g., "UTC+06:00")
 * @param userTimeZone - The target timezone for the user (e.g., "UTC+02:00")
 * @param meetingDate - The date of the meeting in ISO string format (e.g., "2025-05-21T00:00:00.000Z")
 * @param fromTime - The meeting start time (e.g., "02:00 PM")
 * @param toTime - The meeting end time (e.g., "03:30 PM")
 * @returns The duration between the converted start and end times (e.g., "1h 30m")
 */
export const calculateTimeDurationByConvertedTimes = (
  currentTimeZone: string,
  userTimeZone: string,
  meetingDate: string,
  fromTime: string,
  toTime: string
) => {
  const from = convertTimeBetweenTimeZones(currentTimeZone, userTimeZone, meetingDate, fromTime);
  const to = convertTimeBetweenTimeZones(currentTimeZone, userTimeZone, meetingDate, toTime);
  const timeDuration = getDuration(from, to);
  return timeDuration;
};
