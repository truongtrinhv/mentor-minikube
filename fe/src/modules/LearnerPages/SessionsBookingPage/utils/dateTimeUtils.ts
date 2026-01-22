import type { AvailableSlots, ScheduleData } from "../types";

export const combineDateTime = (dateStr: string, timeStr: string): Date => {
    try {
        const baseDate = new Date(dateStr);

        if (timeStr.includes("T") || timeStr.includes("Z")) {
            return new Date(timeStr);
        }

        const [hours, minutes] = timeStr.split(":").map(Number);

        const combinedDate = new Date(baseDate);
        combinedDate.setUTCHours(hours, minutes, 0, 0);

        return combinedDate;
    } catch (error) {
        console.error("Error combining date/time:", error, dateStr, timeStr);
        return new Date();
    }
};

export const formatTimeForDisplay = (dateTime: Date): string => {
    try {
        const formattedTime = dateTime.toLocaleTimeString("en-US", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        });

        return formattedTime;
    } catch (error) {
        console.error("Error formatting time for display:", error);
        return "00:00";
    }
};

export const getLocalDateKey = (dateTime: Date): string => {
    try {
        const localDate = new Date(dateTime.getTime());
        return localDate.toDateString();
    } catch (error) {
        console.error("Error getting local date key:", error);
        return new Date().toDateString();
    }
};

export const formatSessionTimeRange = (
    startTime: string,
    endTime: string,
): string => {
    try {
        if (!startTime.includes("T") && !endTime.includes("T")) {
            return `${startTime} - ${endTime}`;
        }

        const startDate = new Date(startTime);
        const endDate = new Date(endTime);

        const timeFormat = {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        } as Intl.DateTimeFormatOptions;
        const startTimeStr = startDate.toLocaleTimeString("en-US", timeFormat);
        const endTimeStr = endDate.toLocaleTimeString("en-US", timeFormat);

        return `${startTimeStr} - ${endTimeStr}`;
    } catch (error) {
        console.error("Error formatting session time range:", error);
        return `${startTime} - ${endTime}`;
    }
};

export const processSchedulesToSlots = (
    schedules: ScheduleData[],
): AvailableSlots => {
    const slotsMap: AvailableSlots = {};
    const currentTime = new Date();

    if (!Array.isArray(schedules)) {
        return slotsMap;
    }

    schedules.forEach((schedule) => {
        const startDateTime = combineDateTime(
            schedule.date,
            schedule.startTime,
        );
        const endDateTime = combineDateTime(schedule.date, schedule.endTime);

        if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
            console.warn(
                "Invalid combined date/time:",
                schedule.date,
                schedule.startTime,
                schedule.endTime,
            );
            return;
        }

        if (startDateTime < currentTime) {
            return;
        }

        const dateKey = getLocalDateKey(startDateTime);

        if (!slotsMap[dateKey]) {
            slotsMap[dateKey] = [];
        }

        const displayStartTime = formatTimeForDisplay(startDateTime);
        const displayEndTime = formatTimeForDisplay(endDateTime);

        let displayTimeRange;
        try {
            displayTimeRange = formatSessionTimeRange(
                startDateTime.toISOString(),
                endDateTime.toISOString(),
            );
        } catch (error) {
            console.error("Error formatting session time range:", error);
            displayTimeRange = `${displayStartTime} - ${displayEndTime}`;
        }

        slotsMap[dateKey].push({
            time: displayTimeRange,
            startTime: displayStartTime,
            endTime: displayEndTime,
            available: true,
            scheduleId: schedule.id,
        });
    });

    return slotsMap;
};

export const getCurrentTimeZone = (): string => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
};
