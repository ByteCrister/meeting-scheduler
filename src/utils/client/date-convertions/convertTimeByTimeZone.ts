import { getConvertedTime } from "./convertDateTime";

// ? Converting time durations into my time zone
export const convertTimeByTimeZone = (targetTimeZone: string, toConvertTimeZone: string, time: string, date: string) => {
    return targetTimeZone !== toConvertTimeZone ? getConvertedTime(date, time, toConvertTimeZone) : time;
};