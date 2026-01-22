import { Calendar } from "lucide-react";

import { Badge } from "@/common/components/ui/badge";

type SessionCountBadgeProps = {
    sessionCount: number;
};

export const SessionCountBadge = ({ sessionCount }: SessionCountBadgeProps) => {
    const sessionWord = sessionCount === 1 ? "Session" : "Sessions";

    return (
        <Badge variant="info">
            <Calendar /> {sessionCount} {sessionWord}
        </Badge>
    );
};
