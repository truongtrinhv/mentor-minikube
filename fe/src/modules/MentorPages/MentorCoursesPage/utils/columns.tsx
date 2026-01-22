import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router-dom";

import { CategoryBadge } from "@/common/components/courses/category-badge";
import { CourseLevelBadge } from "@/common/components/courses/course-level-badge";
import { LearnerCountBadge } from "@/common/components/courses/learner-count-badge";
import type { Course } from "@/common/types/course";

import { MentorCourseActionButton } from "../components/mentor-course-action-buttons";

export const columns: ColumnDef<Course>[] = [
    {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => (
            <div className="w-72 truncate dark:text-gray-200">
                <Link
                    to={`/mentor/my-courses/${row.original.id}`}
                    className="underline"
                >
                    {row.getValue("title")}
                </Link>
            </div>
        ),
    },
    {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => (
            <div className="w-72 truncate dark:text-gray-200">
                <CategoryBadge categoryName={row.original.category.name} />
            </div>
        ),
    },
    {
        accessorKey: "level",
        header: "Level",
        cell: ({ row }) => (
            <div className="dark:text-gray-200">
                <CourseLevelBadge level={row.getValue("level")} />
            </div>
        ),
    },
    {
        accessorKey: "learnerCount",
        header: "Learner count",
        cell: ({ row }) => (
            <div className="dark:text-gray-200">
                <LearnerCountBadge
                    learnerCount={row.getValue("learnerCount")}
                />
            </div>
        ),
    },
    {
        accessorKey: "actions",
        header: "Actions",
        cell: ({ row }) => (
            <div className="dark:text-gray-200">
                <MentorCourseActionButton
                    course={row.original}
                    key={row.original.id}
                />
            </div>
        ),
    },
];
