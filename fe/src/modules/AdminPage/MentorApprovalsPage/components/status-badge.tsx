import React from "react";

import { Badge } from "@/common/components/ui/badge";

import { ApplicationStatus } from "../types";

type StatusBadgeProps = {
    status: ApplicationStatus;
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
    const variants = {
        [ApplicationStatus.Pending]:
            "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
        [ApplicationStatus.UnderReview]:
            "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
        [ApplicationStatus.Approved]:
            "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        [ApplicationStatus.Rejected]:
            "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    };

    const statusLabels = {
        [ApplicationStatus.Pending]: "Pending",
        [ApplicationStatus.UnderReview]: "Revision Required",
        [ApplicationStatus.Approved]: "Approved",
        [ApplicationStatus.Rejected]: "Rejected",
    };

    return <Badge className={variants[status]}>{statusLabels[status]}</Badge>;
};

export default StatusBadge;
