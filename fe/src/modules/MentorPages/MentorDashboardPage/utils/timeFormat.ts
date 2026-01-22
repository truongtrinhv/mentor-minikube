export const formatSessionTime = (utcDateString: string) => {
    const dateObject = new Date(utcDateString);

    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(dateObject);
};
