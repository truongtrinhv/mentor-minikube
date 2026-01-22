import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

import DataTableColumnHeader from "@/common/components/table/data-table-column-header";

import { ActionCell } from "./action-cell";
import StatusBadge from "./status-badge";

import {
    type LearnerSessionResponse,
    getSessionTypeName,
} from "../types/learner-session-response";

export const columnBase: ColumnDef<LearnerSessionResponse>[] = [
    {
        accessorKey: "startTime",
        header: "Start Time",
        cell: ({ row }) => (
            <div className="dark:text-gray-200">
                {format(row.getValue("startTime"), "dd/MM/yyyy HH:mm")}
            </div>
        ),
    },
    {
        accessorKey: "endTime",
        header: "End Time",
        cell: ({ row }) => (
            <div className="dark:text-gray-200">
                {format(row.getValue("endTime"), "dd/MM/yyyy HH:mm")}
            </div>
        ),
    },
    {
        accessorKey: "courseName",
        header: "Course",
        cell: ({ row }) => (
            <div className="max-w-72 truncate dark:text-gray-200">
                {row.getValue("courseName")}
            </div>
        ),
    },
    {
        accessorKey: "mentorName",
        header: "Mentor",
        cell: ({ row }) => (
            <div className="max-w-72 truncate dark:text-gray-200">
                {row.getValue("mentorName")}
            </div>
        ),
    },
    {
        accessorKey: "sessionType",
        header: "Session Type",
        cell: ({ row }) => (
            <div className="dark:text-gray-200">
                {getSessionTypeName(row.getValue("sessionType"))}
            </div>
        ),
    },
    {
        accessorKey: "sessionStatus",
        header: "Status",
        cell: ({ row }) => {
            return <StatusBadge status={row.getValue("sessionStatus")} />;
        },
    },
    {
        id: "actions",
        header: ({ column }) => (
            <DataTableColumnHeader
                className="text-center"
                column={column}
                title="Action"
            />
        ),
        cell: ({ row }) => <ActionCell session={row.original} />,
    },
];
