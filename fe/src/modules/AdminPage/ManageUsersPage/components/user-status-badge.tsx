import { Badge } from "@/common/components/ui/badge";

import { type UserStatus, UserStatusMap } from "../types";

const userStatusClassName = {
    0: "bg-green-50 text-green-800 dark:bg-green-800 dark:text-white",
    1: "bg-red-50 text-red-800 dark:bg-red-800 dark:text-white",
    2: "bg-yellow-50 text-yellow-800 dark:bg-yellow-800 dark:text-white",
};

type UserStatusBadgeProps = {
    status: UserStatus;
};

export const UserStatusBadge = ({ status }: UserStatusBadgeProps) => {
    return (
        <Badge className={userStatusClassName[status]}>
            {UserStatusMap[status]}
        </Badge>
    );
};
