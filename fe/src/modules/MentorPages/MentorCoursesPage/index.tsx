import type { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import SearchInput from "@/common/components/input/search-input";
import DataTable from "@/common/components/table/data-table";
import DataTablePagination from "@/common/components/table/data-table-pagination";
import { Button } from "@/common/components/ui/button";
import { PATH } from "@/common/constants/paths";
import { useCourses } from "@/common/hooks/use-courses";
import {
    type Course,
    type CourseQueryParams,
    defaultCourseQueryParams,
} from "@/common/types/course";

import { columns } from "./utils/columns";

export function MentorCoursesPage() {
    const [query, setQuery] = useState<CourseQueryParams>(
        defaultCourseQueryParams,
    );
    const { courses, totalCount, isPending } = useCourses(query);

    const handlePageNumberChange = (pageNumber: number) => {
        setQuery((prev) => ({
            ...prev,
            pageNumber,
        }));
    };

    const handlePageSizeChange = (pageSize: number) => {
        setQuery((prev) => ({
            ...prev,
            pageSize,
            pageNumber: 1,
        }));
    };

    const handleSearchChange = (search: string) => {
        setQuery((prev) => ({
            ...prev,
            search,
            pageNumber: 1,
        }));
    };

    const columnsWithNumbering: ColumnDef<Course>[] = [
        {
            id: "index",
            header: "No.",
            cell: ({ row }) => (
                <div>
                    {(query.pageNumber - 1) * query.pageSize + row.index + 1}
                </div>
            ),
            enableSorting: false,
            enableHiding: false,
        },
        ...columns,
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        My Courses
                    </h1>
                    <p className="text-gray-500">
                        Manage the courses that I deliver on the platform.
                    </p>
                </div>
            </div>

            <div className="rounded-lg border shadow-sm">
                <div className="p-6">
                    <div className="mb-4 flex items-center justify-between gap-x-4 gap-y-2">
                        <SearchInput
                            onSearch={handleSearchChange}
                            characterLimit={250}
                        />

                        <Button asChild>
                            <Link to={PATH.MentorAddCourse}>
                                Add a course <Plus className="ml-2 size-4" />
                            </Link>
                        </Button>
                    </div>

                    <DataTable
                        data={courses}
                        columns={columnsWithNumbering}
                        loading={isPending}
                    />

                    <div className="mt-4">
                        <DataTablePagination
                            pageSize={query.pageSize}
                            pageNumber={query.pageNumber}
                            totalRecords={totalCount}
                            onPageNumberChanged={handlePageNumberChange}
                            onPageSizeChanged={handlePageSizeChange}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
