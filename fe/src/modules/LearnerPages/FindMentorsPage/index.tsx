import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import LoadingSpinner from "@/common/components/loading-spinner";
import DataTablePagination from "@/common/components/table/data-table-pagination";
import useDebounce from "@/common/hooks/use-debounce";

import { FilterPanel, MentorCard, SearchBar } from "./components";
import { useCourseCategoriesLookup } from "./hooks/use-course-categories";
import { useMentors } from "./hooks/use-mentors";
import type { MentorQueryParams, MentorWithCourses } from "./types";
import { defaultMentorQueryParams } from "./types";

const FindMentorsPage: React.FC = () => {
    const navigate = useNavigate();
    const [queryParams, setQueryParams] = useState<MentorQueryParams>(
        defaultMentorQueryParams,
    );

    const debouncedSearch = useDebounce(queryParams.search, 1000);

    const debouncedQueryParams = useMemo(
        () => ({
            ...queryParams,
            search: debouncedSearch,
        }),
        [queryParams, debouncedSearch],
    );

    const { mentors, totalCount, isPending } = useMentors(debouncedQueryParams);
    const { categories } = useCourseCategoriesLookup();

    const handleSearchChange = (value: string) => {
        setQueryParams((prev: MentorQueryParams) => ({
            ...prev,
            search: value,
            pageNumber: 1,
        }));
    };

    const handleCategoryChange = (categoryId: string | null) => {
        setQueryParams((prev: MentorQueryParams) => ({
            ...prev,
            categoryId: categoryId || "",
            pageNumber: 1,
        }));
    };

    const handleClearFilters = () => {
        setQueryParams({
            ...defaultMentorQueryParams,
            pageSize: queryParams.pageSize,
        });
    };

    const handlePageNumberChange = (pageNumber: number) => {
        setQueryParams((prev: MentorQueryParams) => ({
            ...prev,
            pageNumber,
        }));
    };

    const handlePageSizeChange = (pageSize: number) => {
        setQueryParams((prev: MentorQueryParams) => ({
            ...prev,
            pageSize,
            pageNumber: 1,
        }));
    };

    const handleBookMentor = (mentorId: string) => {
        const mentor = mentors.find(
            (m: MentorWithCourses) => m.id === mentorId,
        );

        navigate(`/learner/sessions?courseId=${mentor?.courses[0].id}`, {
            state: {
                mentor: mentor,
                course: mentor?.courses[0],
            },
        });
    };

    // Show loading state
    if (isPending) {
        return (
            <div className="container mx-auto p-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Find Mentors
                    </h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">
                        Explore and connect with experienced mentors
                    </p>
                </div>

                <div className="flex min-h-[300px] items-center justify-center">
                    <LoadingSpinner size="lg" />
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Find Mentors
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                    Explore and connect with experienced mentors
                </p>
            </div>

            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
                {/* Filters - Left Sidebar */}
                <div className="md:col-span-1">
                    <FilterPanel
                        selectedCategoryId={queryParams.categoryId || null}
                        categories={categories}
                        onCategoryChange={handleCategoryChange}
                        onClearFilters={handleClearFilters}
                    />
                </div>

                {/* Search Results - Main Content */}
                <div className="md:col-span-3">
                    {/* Search Bar */}
                    <div className="mb-6">
                        <SearchBar
                            value={queryParams.search}
                            onChange={handleSearchChange}
                            placeholder="Search for mentors..."
                        />
                    </div>

                    {/* Results count */}
                    <div className="mb-6">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Found {totalCount} mentor
                            {totalCount !== 1 ? "s" : ""}
                        </p>
                    </div>

                    {/* Mentors Grid */}
                    {totalCount === 0 ? (
                        <div className="py-12 text-center">
                            <p className="text-gray-500 dark:text-gray-400">
                                No mentors found. Please try a different search.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                {mentors.map((mentor: MentorWithCourses) => (
                                    <MentorCard
                                        key={mentor.id}
                                        mentor={mentor}
                                        onBookMentor={handleBookMentor}
                                    />
                                ))}
                            </div>

                            {/* Pagination */}
                            <div className="mt-6">
                                <DataTablePagination
                                    pageSize={queryParams.pageSize}
                                    pageNumber={queryParams.pageNumber}
                                    totalRecords={totalCount}
                                    onPageNumberChanged={handlePageNumberChange}
                                    onPageSizeChanged={handlePageSizeChange}
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FindMentorsPage;
