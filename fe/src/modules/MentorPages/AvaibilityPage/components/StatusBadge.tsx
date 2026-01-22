import { Badge } from "@/common/components/ui/badge";

import { type TimeSlotResponse, TimeSlotStatus } from "../types";

type StatusBadgeProps = {
    status: TimeSlotResponse["status"];
};

export const StatusBadge = ({ status }: StatusBadgeProps) => {
    switch (status) {
        case TimeSlotStatus.Available:
            return (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                    Available
                </Badge>
            );
        case TimeSlotStatus.Unavailable:
            return (
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                    Unavailable
                </Badge>
            );
        default:
            return <Badge variant="outline">Unknown</Badge>;
    }
};
