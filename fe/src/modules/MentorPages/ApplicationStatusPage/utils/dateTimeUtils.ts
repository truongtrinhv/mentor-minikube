export const convertLocalDateToUtc = (localDate: Date): string => {
    try {
        const utcDate = new Date(
            localDate.getTime() + localDate.getTimezoneOffset() * 60000,
        );
        return utcDate.toISOString();
    } catch (error) {
        console.error("Error converting local date to UTC:", error);
        return localDate.toISOString();
    }
};

export const formatDateTimeForDisplay = (dateString?: string): string => {
    if (!dateString) return "N/A";

    try {
        // Convert UTC date to local timezone for display
        const utcDate = new Date(dateString);
        const localDate = new Date(
            utcDate.getTime() - utcDate.getTimezoneOffset() * 60000,
        );

        return localDate.toLocaleString("vi-VN", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            timeZoneName: "short",
        });
    } catch (error) {
        console.error("Error formatting date for display:", error);
        return dateString;
    }
};

export const formatDateTimeForDisplayEn = (dateString?: string): string => {
    if (!dateString) return "N/A";

    try {
        // Convert UTC date to local timezone for display
        const utcDate = new Date(dateString);
        const localDate = new Date(
            utcDate.getTime() - utcDate.getTimezoneOffset() * 60000,
        );

        return localDate.toLocaleString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch (error) {
        console.error("Error formatting date for display:", error);
        return dateString;
    }
};
