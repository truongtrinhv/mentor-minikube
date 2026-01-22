import { BookOpen, Mail, Search, TrendingUp, Users } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/common/components/ui/avatar";
import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/common/components/ui/card";
import { Input } from "@/common/components/ui/input";
import { Skeleton } from "@/common/components/ui/skeleton";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/common/components/ui/tooltip";

import type { EnrolledCourse } from "../types";
import { CourseLevel } from "../types";

type EnrolledCoursesProps = {
    courses: EnrolledCourse[];
};

const getLevelColor = (level: CourseLevel) => {
    switch (level) {
        case CourseLevel.Beginner:
            return "bg-green-100 text-green-800 dark:bg-green-950/20 dark:text-green-400";
        case CourseLevel.Intermediate:
            return "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/20 dark:text-yellow-400";
        case CourseLevel.Advanced:
            return "bg-red-100 text-red-800 dark:bg-red-950/20 dark:text-red-400";
        default:
            return "bg-gray-100 text-gray-800 dark:bg-gray-950/20 dark:text-gray-400";
    }
};

const getLevelText = (level: CourseLevel) => {
    switch (level) {
        case CourseLevel.Beginner:
            return "Beginner";
        case CourseLevel.Intermediate:
            return "Intermediate";
        case CourseLevel.Advanced:
            return "Advanced";
        default:
            return "Unknown";
    }
};

export const EnrolledCourses: React.FC<EnrolledCoursesProps> = ({
    courses,
}) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [displayCount, setDisplayCount] = useState(2);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const endOfListRef = useRef<HTMLDivElement>(null);

    const filteredCourses = useMemo(() => {
        if (!searchQuery.trim()) {
            return courses;
        }

        const query = searchQuery.trim().toLowerCase();

        return courses.filter((course) => {
            const titleMatch = course.title.toLowerCase().includes(query);

            const descriptionMatch = course.description
                .toLowerCase()
                .replace(/\s+/g, "")
                .includes(query.replace(/\s+/g, ""));

            return titleMatch || descriptionMatch;
        });
    }, [courses, searchQuery]);

    const displayCourses = filteredCourses.slice(0, displayCount);

    const loadMore = () => {
        if (displayCount < filteredCourses.length) {
            setIsLoadingMore(true);
            setTimeout(() => {
                setDisplayCount((prev) =>
                    Math.min(prev + 2, filteredCourses.length),
                );
                setIsLoadingMore(false);
            }, 1000);
        }
    };

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (
                    entries[0].isIntersecting &&
                    !isLoadingMore &&
                    displayCount < filteredCourses.length
                ) {
                    loadMore();
                }
            },
            { threshold: 0.5 },
        );

        if (endOfListRef.current) {
            observer.observe(endOfListRef.current);
        }

        return () => {
            if (endOfListRef.current) {
                observer.unobserve(endOfListRef.current);
            }
        };
    }, [displayCount, filteredCourses.length, isLoadingMore]);

    return (
        <Card className="flex h-full flex-col">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold">
                    My courses
                </CardTitle>
                <div className="relative w-[200px]">
                    <Search className="absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                    <Input
                        className="pl-8"
                        placeholder="Search courses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </CardHeader>
            <CardContent className="flex-grow overflow-hidden">
                <div className="h-[350px] overflow-y-auto pr-2">
                    {courses.length === 0 ? (
                        <div className="flex h-full items-center justify-center py-8 text-center">
                            <div>
                                <BookOpen className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                                <p className="mb-4 text-gray-500 dark:text-gray-400">
                                    You haven't enrolled in any courses yet
                                </p>
                                <Link to="/learner/courses">
                                    <Button>Explore courses</Button>
                                </Link>
                            </div>
                        </div>
                    ) : filteredCourses.length === 0 ? (
                        <div className="flex h-full items-center justify-center py-8 text-center">
                            <p className="text-gray-500 dark:text-gray-400">
                                No courses found matching
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4 pr-1">
                            {displayCourses.map((course) => (
                                <div
                                    key={course.id}
                                    className="rounded-lg border p-4 transition-shadow hover:shadow-md"
                                >
                                    {/* Course Header */}
                                    <div className="mb-3">
                                        <div className="mb-2 flex items-start justify-between gap-2">
                                            <h3 className="font-semibold break-all text-gray-900 dark:text-white">
                                                {course.title}
                                            </h3>
                                            <Badge
                                                className={getLevelColor(
                                                    course.level,
                                                )}
                                            >
                                                {getLevelText(course.level)}
                                            </Badge>
                                        </div>

                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <p className="cursor-help truncate text-sm break-all text-gray-600 dark:text-gray-400">
                                                        {course.description}
                                                    </p>
                                                </TooltipTrigger>
                                                <TooltipContent className="max-w-xs break-all">
                                                    <p>{course.description}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>

                                        <div className="mt-2 flex items-center justify-between">
                                            <Badge
                                                variant="outline"
                                                className="text-xs"
                                            >
                                                {course.category.name}
                                            </Badge>
                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                                <Users className="h-3 w-3" />
                                                {course.learnerCount} learners
                                            </div>
                                        </div>
                                    </div>

                                    {/* Mentor Info */}
                                    <div className="mb-4 flex items-center gap-2">
                                        <Avatar className="h-6 w-6">
                                            <AvatarImage
                                                src={course.mentorAvatar}
                                                alt={course.mentorName}
                                            />
                                            <AvatarFallback className="text-xs">
                                                {course.mentorName
                                                    .split(" ")
                                                    .map((n) => n[0])
                                                    .join("")}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                {course.mentorName}
                                            </div>
                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                                <Mail className="h-3 w-3" />
                                                {course.mentorEmail}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Sessions Info */}
                                    <div className="mb-4 grid grid-cols-2 gap-2 text-center">
                                        <div className="rounded-lg bg-blue-50 p-2 dark:bg-blue-950/20">
                                            <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                                {course.scheduledSessionCount}
                                            </div>
                                            <div className="text-xs text-blue-600 dark:text-blue-400">
                                                Scheduled
                                            </div>
                                        </div>
                                        <div className="rounded-lg bg-green-50 p-2 dark:bg-green-950/20">
                                            <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                                                {course.completedSessionCount}
                                            </div>
                                            <div className="text-xs text-green-600 dark:text-green-400">
                                                Completed
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <Link to={`/learner/courses/${course.id}`}>
                                        <Button className="w-full" size="sm">
                                            <TrendingUp className="mr-2 h-4 w-4" />
                                            View details
                                        </Button>
                                    </Link>
                                </div>
                            ))}

                            {/* Loading indicator & end of list marker */}
                            {isLoadingMore && (
                                <div className="py-4">
                                    <Skeleton className="h-16 w-full rounded-lg" />
                                </div>
                            )}

                            {/* Invisible div for intersection observer */}
                            {displayCount < filteredCourses.length && (
                                <div ref={endOfListRef} className="h-4" />
                            )}

                            {/* Show "All courses loaded" message when all courses are displayed */}
                            {displayCount >= filteredCourses.length &&
                                filteredCourses.length > 0 && (
                                    <div className="py-2 text-center text-sm text-gray-500">
                                        All courses loaded
                                    </div>
                                )}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
