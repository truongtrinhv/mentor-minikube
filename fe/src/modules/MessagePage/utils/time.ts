/**
 * Formats a UTC date into a user-friendly local time string
 * @param utcDate - The date in UTC that needs to be converted and formatted
 * @returns Formatted local time string
 */
export const formatMessageTimestamp = (utcDate: Date | string): string => {
    // Handle both Date objects and string inputs
    let date: Date;

    if (utcDate instanceof Date) {
        date = new Date(utcDate);
    } else if (typeof utcDate === "string") {
        // Handle both formats: with and without 'Z' timezone indicator
        date = new Date(utcDate.endsWith("Z") ? utcDate : `${utcDate}Z`);
    } else {
        date = new Date();
    }

    // Create a local date object for consistent comparison
    const localDate = new Date(date);

    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    // Today - show time only (e.g., "2:30 PM")
    if (localDate.toDateString() === now.toDateString()) {
        return localDate.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
    }

    // Yesterday - show "Yesterday" and time
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (localDate.toDateString() === yesterday.toDateString()) {
        return `Yesterday ${localDate.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        })}`;
    }

    // Within last 7 days - show day of week and time (e.g., "Mon 2:30 PM")
    if (diffInHours < 7 * 24) {
        return localDate.toLocaleString("en-US", {
            weekday: "short",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
    }

    // This year - show month, day, and time (e.g., "Mar 15, 2:30 PM")
    if (localDate.getFullYear() === now.getFullYear()) {
        return localDate.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
    }

    // Older than current year - show full date (e.g., "12/31/2022, 2:30 PM")
    return localDate.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
};

export const formatNotificationTimestamp = (utcDate: Date | string): string => {
    // Handle both Date objects and string inputs
    let date: Date;

    if (utcDate instanceof Date) {
        date = new Date(utcDate);
    } else if (typeof utcDate === "string") {
        // Handle both formats: with and without 'Z' timezone indicator
        date = new Date(utcDate.endsWith("Z") ? utcDate : `${utcDate}Z`);
    } else {
        date = new Date();
    }

    // Create a local date object for consistent comparison
    const localDate = new Date(date);

    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    // Today - show time only (e.g., "2:30 PM")
    if (localDate.toDateString() === now.toDateString()) {
        return localDate.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
    }

    // Yesterday - show "Yesterday" and time
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (localDate.toDateString() === yesterday.toDateString()) {
        return `Yesterday ${localDate.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        })}`;
    }

    // Within last 7 days - show day of week and time (e.g., "Mon 2:30 PM")
    if (diffInHours < 7 * 24) {
        return localDate.toLocaleString("en-US", {
            weekday: "short",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
    }

    // This year - show month, day, and time (e.g., "Mar 15, 2:30 PM")
    if (localDate.getFullYear() === now.getFullYear()) {
        return localDate.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
    }

    // Older than current year - show full date (e.g., "12/31/2022, 2:30 PM")
    return localDate.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
};
