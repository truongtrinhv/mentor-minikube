import type { ColumnDef } from "@tanstack/react-table";

import type { Resource } from "@/common/types/resource";

import { LearnerResourceActionButtons } from "../components/learner-resource-action-buttons";

export const columns: ColumnDef<Resource>[] = [
    {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => (
            <div className="w-72 truncate dark:text-gray-200">
                {row.getValue("title")}
            </div>
        ),
    },
    {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => (
            <div className="w-72 truncate dark:text-gray-200">
                {row.getValue("description")}
            </div>
        ),
    },
    {
        accessorKey: "fileType",
        header: "File type",
        cell: ({ row }) => (
            <div className="dark:text-gray-200">{row.getValue("fileType")}</div>
        ),
    },
    {
        accessorKey: "actions",
        header: "Actions",
        cell: ({ row }) => (
            <div className="dark:text-gray-200">
                <LearnerResourceActionButtons
                    resource={row.original}
                    key={row.original.id}
                />
            </div>
        ),
    },
];
