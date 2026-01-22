import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/common/components/ui/tooltip";

import { ActionCell } from "../components/action-cell";
import { UserStatusBadge } from "../components/user-status-badge";
import { type Role, RoleMap, type User } from "../types";

export const columns: ColumnDef<User>[] = [
    {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
            <div className="w-72 truncate dark:text-gray-200">
                {row.original.userDetail.fullName}
            </div>
        ),
    },
    {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => (
            <div className="w-96 dark:text-gray-200">
                <Tooltip>
                    <TooltipTrigger className="max-w-full truncate">
                        {row.getValue("email")}
                    </TooltipTrigger>
                    <TooltipContent>
                        <div className="dark:text-gray-200">
                            {row.getValue("email")}
                        </div>
                    </TooltipContent>
                </Tooltip>
            </div>
        ),
    },
    {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => (
            <div className="dark:text-gray-200">
                {RoleMap[row.getValue("role") as Role]}
            </div>
        ),
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
            <div className="dark:text-gray-200">
                <UserStatusBadge status={row.getValue("status")} />
            </div>
        ),
    },
    {
        accessorKey: "createdAt",
        header: "Join Date",
        cell: ({ row }) => {
            const joinDate = new Date(row.getValue("createdAt"));
            return (
                <div className="dark:text-gray-200">
                    {format(joinDate, "dd/MM/yyyy")}
                </div>
            );
        },
    },
    {
        accessorKey: "lastActive",
        header: "Last Active",
        cell: ({ row }) => {
            const lastActive = new Date(row.getValue("lastActive"));
            return (
                <div className="dark:text-gray-200">
                    {format(lastActive, "dd/MM/yyyy")}
                </div>
            );
        },
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
            const user = row.original;
            return <ActionCell user={user} />;
        },
    },
];
