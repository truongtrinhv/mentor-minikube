import type { ColumnDef } from "@tanstack/react-table";

import type { CourseCategoryResponse } from "../types/course-response";

export const columnBase: ColumnDef<CourseCategoryResponse>[] = [
    {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
            <div className="dark:text-gray-200">{row.getValue("name")}</div>
        ),
    },
    {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => (
            <div className="max-w-72 truncate dark:text-gray-200">
                {row.getValue("description")}
            </div>
        ),
    },
    {
        accessorKey: "courseCount",
        header: "Courses",
        cell: ({ row }) => (
            <div className="dark:text-gray-200">
                {row.getValue("courseCount")}
            </div>
        ),
    },
    {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("isActive");
            return (
                <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        status
                            ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                            : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                    }`}
                >
                    {status ? "Active" : "Inactive"}
                </span>
            );
        },
    },
];
