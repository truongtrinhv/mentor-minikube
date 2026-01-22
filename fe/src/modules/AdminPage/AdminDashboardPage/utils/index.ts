export const getInitials = (fullName: string): string => {
    if (!fullName) return "";

    const words = fullName
        .trim()
        .split(/\s+/)
        .filter((word) => word.length > 0);

    const firstInitial = words[0]?.[0]?.toUpperCase() || "";
    const secondInitial = words[1]?.[0]?.toUpperCase() || "";

    return firstInitial + secondInitial;
};
