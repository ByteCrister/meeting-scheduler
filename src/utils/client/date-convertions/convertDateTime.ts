import { convertToUtcISOString } from "./convertToUtcISOString";
import { formatUtcToLocalTime } from "./formatUtcToLocalTime";

export const getConvertedTime = (date: string, time: string, timeZoneOffset: string) => {
    return formatUtcToLocalTime(convertToUtcISOString(date, time, timeZoneOffset), timeZoneOffset);
};