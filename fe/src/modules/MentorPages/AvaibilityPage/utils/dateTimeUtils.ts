import type {
    CreateScheduleRequest,
    EditScheduleRequest,
    TimeBlockRequest,
} from "../types";

export const formatDateForBackend = (date: Date): string => {
    const utcDate = new Date(
        Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
    );

    const year = utcDate.getUTCFullYear();
    const month = String(utcDate.getUTCMonth() + 1).padStart(2, "0");
    const day = String(utcDate.getUTCDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

export const formatTimeDisplay = (time: string): string => {
    if (time.includes(":")) {
        const parts = time.split(":");
        return `${parts[0]}:${parts[1]}`;
    }
    return time;
};

export const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
};

export const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

export const isDateTimeInFuture = (date: Date, timeString: string): boolean => {
    try {
        const formattedTime = formatTimeDisplay(timeString);
        const [hours, minutes] = formattedTime.split(":").map(Number);
        const dateTime = new Date(date);
        dateTime.setHours(hours, minutes, 0, 0);

        return dateTime > new Date();
    } catch (error) {
        console.error("Error parsing time:", timeString, error);
        return false;
    }
};

export const validateScheduleRequest = (
    dates: Date[],
    startTime: string,
    endTime: string,
): string | null => {
    if (dates.length === 0) {
        return "Please select at least one date";
    }

    const [startHours, startMinutes] = startTime.split(":").map(Number);
    const [endHoursOriginal, endMinutes] = endTime.split(":").map(Number);
    let endHours = endHoursOriginal;

    if (
        endHours < startHours ||
        (endHours === startHours && endMinutes < startMinutes)
    ) {
        endHours += 24;
    }
    const duration = (endHours - startHours) * 60 + (endMinutes - startMinutes);

    if (duration < 30) {
        return "Minimum time must be 30 minutes";
    }

    if (duration > 1080) {
        return "Time duration must be less than 18 hours";
    }

    const invalidDates = dates.filter(
        (date) => !isDateTimeInFuture(date, startTime),
    );
    if (invalidDates.length > 0) {
        return "All selected dates and times must be greater than the current time.";
    }

    return null;
};

export const convertUtcToLocalTime = (utcTime: string, date?: Date): string => {
    try {
        let dateTime: Date;

        if (utcTime.includes("T") || utcTime.includes("Z")) {
            dateTime = new Date(utcTime);
        } else {
            const [hours, minutes] = utcTime.split(":").map(Number);
            dateTime = date ? new Date(date) : new Date();
            dateTime.setUTCHours(hours, minutes, 0, 0);
        }

        const localHours = dateTime.getHours();
        const localMinutes = dateTime.getMinutes();

        return `${String(localHours).padStart(2, "0")}:${String(localMinutes).padStart(2, "0")}`;
    } catch (error) {
        console.error("Error converting UTC to local time:", error);
        return utcTime.includes(":") ? utcTime : `${utcTime}:00`;
    }
};

export const createUtcDateTime = (date: Date, localTime: string): string => {
    try {
        const [hours, minutes] = localTime.split(":").map(Number);

        const localDateTime = new Date(date.getTime());

        localDateTime.setHours(hours, minutes, 0, 0);

        const year = localDateTime.getFullYear();
        const month = localDateTime.getMonth();
        const day = localDateTime.getDate();
        const newDateTime = new Date(year, month, day, hours, minutes, 0, 0);

        return newDateTime.toISOString();
    } catch (error) {
        console.error("Error creating UTC DateTime:", error);
        throw new Error("Invalid date or time format");
    }
};

export const createScheduleRequest = (
    dates: Date[],
    startTime: string,
    endTime: string,
    isRepeating: boolean,
    repeatingWeeks: number,
): CreateScheduleRequest => {
    const timeBlocks: TimeBlockRequest[] = [];

    dates.forEach((date) => {
        timeBlocks.push({
            startTime: createUtcDateTime(date, startTime),
            endTime: createUtcDateTime(date, endTime),
        });
    });

    return {
        timeBlocks,
        isRepeating,
        repeatingWeeks,
    };
};

export const createEditScheduleRequest = (
    date: Date,
    startTime: string,
    endTime: string,
): EditScheduleRequest => {
    return {
        timeBlock: {
            startTime: createUtcDateTime(date, startTime),
            endTime: createUtcDateTime(date, endTime),
        },
    };
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

        const startDay = startDate.toLocaleDateString();
        const endDay = endDate.toLocaleDateString();

        if (startDay !== endDay) {
            const dateFormat = {
                month: "short",
                day: "numeric",
            } as Intl.DateTimeFormatOptions;
            const startDateStr = startDate.toLocaleDateString(
                "en-US",
                dateFormat,
            );
            const endDateStr = endDate.toLocaleDateString("en-US", dateFormat);

            return `${startTimeStr} (${startDateStr}) - ${endTimeStr} (${endDateStr})`;
        }

        return `${startTimeStr} - ${endTimeStr}`;
    } catch (error) {
        console.error("Error formatting session time range:", error);
        return `${startTime} - ${endTime}`;
    }
};
