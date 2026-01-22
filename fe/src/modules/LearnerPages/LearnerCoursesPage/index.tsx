import { useState } from "react";

import { CourseCard } from "@/common/components/courses/course-card";
import SearchInput from "@/common/components/input/search-input";
import { SelectWithRemoteSearch } from "@/common/components/input/select-with-remote-search";
import LoadingSpinner from "@/common/components/loading-spinner";
import DataTablePagination from "@/common/components/table/data-table-pagination";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/common/components/ui/select";
import { useCourses } from "@/common/hooks/use-courses";
import {
    type CourseLevel,
    type CourseQueryParams,
    defaultCourseQueryParams,
} from "@/common/types/course";

import { mentorLookupServices } from "./services/mentorLookupServices";
import type { MentorLookup } from "./types";

import courseCategoryService from "../../AdminPage/ManageCourseCategoryPage/services/courseCategoryService";
import type { CourseCategoryLookUpResponse } from "../../AdminPage/ManageCourseCategoryPage/types/course-response";

export function LearnerCoursesPage() {
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

    const handleCategoryIdChange = (categoryId: string) => {
        setQuery((prev) => ({
            ...prev,
            categoryId,
            pageNumber: 1,
        }));
    };

    const handleMentorIdChange = (mentorId: string) => {
        setQuery((prev) => ({
            ...prev,
            mentorId,
            pageNumber: 1,
        }));
    };

    const handleLevelChange = (level: 0 | 1 | 2 | "clear") => {
        setQuery((prev) => ({
            ...prev,
            level: level === "clear" ? "" : level,
            pageNumber: 1,
        }));
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Browse Courses
                    </h1>
                    <p className="text-gray-500">
                        Start learning a new skill today!
                    </p>
                </div>
            </div>

            <div className="rounded-lg border shadow-sm">
                <div className="p-6">
                    <div className="mb-4 flex items-center gap-x-4 gap-y-2">
                        <SearchInput
                            onSearch={handleSearchChange}
                            characterLimit={250}
                        />

                        <SelectWithRemoteSearch<CourseCategoryLookUpResponse>
                            placeholder="Filter by category"
                            value={query.categoryId}
                            onChange={handleCategoryIdChange}
                            getValue={(category) => category.id}
                            getLabel={(category) => category.name}
                            queryFunction={async () => {
                                try {
                                    const result =
                                        await courseCategoryService.lookup();
                                    const data = result.data;
                                    return data || [];
                                } catch {
                                    return [];
                                }
                            }}
                            queryKey="course-category"
                            refetchOptionsOnSearch={false}
                            className="w-72"
                        />

                        <SelectWithRemoteSearch<MentorLookup>
                            placeholder="Filter by mentor"
                            value={query.mentorId}
                            onChange={handleMentorIdChange}
                            getValue={(mentor) => mentor.id}
                            getLabel={(mentor) => mentor.name}
                            queryFunction={async (search: string) => {
                                try {
                                    const params = {
                                        pageSize: 10,
                                        pageNumber: 1,
                                        search: search,
                                    };
                                    const result =
                                        await mentorLookupServices.lookup(
                                            params,
                                        );
                                    const data = result.data?.items;
                                    return data || [];
                                } catch {
                                    return [];
                                }
                            }}
                            queryKey="mentor-lookup"
                            className="w-72"
                            searchQueryCharacterLimit={250}
                        />

                        <Select
                            onValueChange={(value: string) => {
                                if (value === "clear")
                                    return handleLevelChange(value);
                                handleLevelChange(Number(value) as CourseLevel);
                            }}
                            value={`${query.level}`}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Level" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem
                                    value="clear"
                                    className="font-medium italic"
                                >
                                    Clear
                                </SelectItem>
                                <SelectItem value="0">Beginner</SelectItem>
                                <SelectItem value="1">Intermediate</SelectItem>
                                <SelectItem value="2">Advanced</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
                        {isPending && <LoadingSpinner />}

                        {courses?.length === 0 && (
                            <p className="text-center">No courses found.</p>
                        )}

                        {courses &&
                            courses.map((course) => (
                                <CourseCard course={course} key={course.id} />
                            ))}
                    </div>

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
