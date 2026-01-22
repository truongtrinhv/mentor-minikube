import { cn } from "@/common/lib/utils";
import { SessionStatus } from "@/common/types/enums";

import { getSessionStatusName } from "../types/mentoring-session-response";

type StatusBadgeProps = {
    status?: SessionStatus;
};
export default function StatusBadge(props: StatusBadgeProps) {
    const { status } = props;
    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                status === SessionStatus.Completed &&
                    "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100",
                status === SessionStatus.Cancelled &&
                    "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100",
                status === SessionStatus.Pending &&
                    "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100",
                status === SessionStatus.Rescheduling &&
                    "bg-purple-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100",
                status === SessionStatus.Scheduled &&
                    "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100",
            )}
        >
            {getSessionStatusName(status)}
        </span>
    );
}
