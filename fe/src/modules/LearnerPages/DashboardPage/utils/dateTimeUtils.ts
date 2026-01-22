export const convertUtcToLocal = (utcDateString: string): Date => {
    try {
        return new Date(utcDateString);
    } catch (error) {
        console.error("Error converting UTC to local:", error);
        return new Date();
    }
};

export const formatDateTimeLocal = (utcDateString: string): string => {
    try {
        const localDate = convertUtcToLocal(utcDateString);
        return new Intl.DateTimeFormat("en-US", {
            weekday: "long",
            day: "2-digit",
            month: "short",
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }).format(localDate);
    } catch (error) {
        console.error("Error formatting local date time:", error);
        return "Invalid Date";
    }
};

export const formatTimeLocal = (utcDateString: string): string => {
    try {
        const localDate = convertUtcToLocal(utcDateString);
        return new Intl.DateTimeFormat("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }).format(localDate);
    } catch (error) {
        console.error("Error formatting local time:", error);
        return "Invalid Time";
    }
};

export const formatSessionTimeRange = (
    startTimeUtc: string,
    endTimeUtc: string,
): string => {
    try {
        const startLocal = convertUtcToLocal(startTimeUtc);
        const endLocal = convertUtcToLocal(endTimeUtc);

        const timeFormat = {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        } as Intl.DateTimeFormatOptions;
        const startTimeStr = startLocal.toLocaleTimeString("en-US", timeFormat);
        const endTimeStr = endLocal.toLocaleTimeString("en-US", timeFormat);

        const startDay = startLocal.toLocaleDateString();
        const endDay = endLocal.toLocaleDateString();

        if (startDay !== endDay) {
            const dateFormat = {
                month: "short",
                day: "numeric",
            } as Intl.DateTimeFormatOptions;
            const startDateStr = startLocal.toLocaleDateString(
                "en-US",
                dateFormat,
            );
            const endDateStr = endLocal.toLocaleDateString("en-US", dateFormat);

            return `${startTimeStr} (${startDateStr}) - ${endTimeStr} (${endDateStr})`;
        }

        return `${startTimeStr} - ${endTimeStr}`;
    } catch (error) {
        console.error("Error formatting session time range:", error);
        return "Invalid Time Range";
    }
};

export const getTimeUntilSessionLocal = (utcDateString: string): string => {
    try {
        const sessionDate = convertUtcToLocal(utcDateString);
        const now = new Date();
        const diffInMinutes = Math.floor(
            (sessionDate.getTime() - now.getTime()) / (1000 * 60),
        );

        if (diffInMinutes < 0) return "Past";
        if (diffInMinutes < 60) return `${diffInMinutes} minutes`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours} hours`;

        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays} days`;
    } catch (error) {
        console.error("Error calculating time until session:", error);
        return "Unknown";
    }
};
