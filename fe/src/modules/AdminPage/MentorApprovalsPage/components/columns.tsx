import { type ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";

import DataTableColumnHeader from "@/common/components/table/data-table-column-header";
import { Button } from "@/common/components/ui/button";

import { ApplicationStatus, type MentorApplicationResponse } from "../types";

export const getColumns = (
    handleViewDetails: (application: MentorApplicationResponse) => void,
): ColumnDef<MentorApplicationResponse>[] => [
    {
        accessorKey: "fullName",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Full Name" />
        ),
        cell: ({ row }) => (
            <div className="w-72 truncate font-medium">
                {row.original.fullName}
            </div>
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "summitted",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Applied Date" />
        ),
        cell: ({ row }) => {
            // Format date to readable format
            try {
                const date = new Date(row.original.summitted);
                return date.toLocaleDateString();
            } catch (error) {
                console.log(error);
                return row.original.summitted;
            }
        },
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "status",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => {
            const status = row.original.status as ApplicationStatus;
            const statusMap = {
                [ApplicationStatus.Pending]: {
                    label: "Pending",
                    className: "bg-yellow-100 text-yellow-800",
                },
                [ApplicationStatus.UnderReview]: {
                    label: "Revision Required",
                    className: "bg-blue-100 text-blue-800",
                },
                [ApplicationStatus.Approved]: {
                    label: "Approved",
                    className: "bg-green-100 text-green-800",
                },
                [ApplicationStatus.Rejected]: {
                    label: "Rejected",
                    className: "bg-red-100 text-red-800",
                },
            };

            return (
                <span
                    className={`rounded px-2 py-1 text-xs font-medium ${statusMap[status].className}`}
                >
                    {statusMap[status].label}
                </span>
            );
        },
        enableSorting: false,
        enableHiding: false,
    },
    {
        id: "actions",
        header: ({ column }) => (
            <DataTableColumnHeader
                column={column}
                title="Actions"
                className="text-right"
            />
        ),
        cell: ({ row }) => (
            <div className="flex justify-end space-x-2">
                <Button
                    onClick={() => handleViewDetails(row.original)}
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 py-0"
                >
                    <Eye size={14} />
                </Button>
            </div>
        ),
        enableSorting: false,
        enableHiding: false,
    },
];
