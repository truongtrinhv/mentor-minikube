import { Meh } from "lucide-react";

import LoadingSpinner from "@/common/components/loading-spinner";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/common/components/ui/card";
import { cn } from "@/common/lib/utils";

import { MonthlyGrowthBadge } from "./monthly-growth-badge";
import { MostPopularCourseCard } from "./most-popular-course-card";

import type { CourseAndResourceStats, MostPopularCourse } from "../types";

type UserStatisticsCardProps = {
    courseResourceStats?: CourseAndResourceStats;
    popularCourses?: MostPopularCourse[];
    isLoading: boolean;
    isError: boolean;
};

export const CourseResourceStatisticsCard = (
    props: UserStatisticsCardProps,
) => {
    const { courseResourceStats, popularCourses, isLoading, isError } = props;

    return (
        <Card>
            {isLoading && <LoadingSpinner className="m-auto" />}
            {isError && (
                <p className="m-auto">
                    Failed to load course and resource statistics. Please come
                    back later.
                </p>
            )}
            {courseResourceStats && popularCourses && (
                <>
                    <CardHeader>
                        <CardTitle>
                            <p className="text-xl font-medium">
                                Course & Resources
                            </p>
                            <div className="my-6 grid grid-cols-2">
                                <div>
                                    <p className="text-2xl font-medium">
                                        {courseResourceStats.courseCount}
                                    </p>
                                    <p className="mb-2 text-xl font-medium">
                                        Courses
                                    </p>
                                    <MonthlyGrowthBadge
                                        growthAmount={
                                            courseResourceStats.newCourseThisMonthCount
                                        }
                                    />
                                </div>
                                <div>
                                    <p className="text-2xl font-medium">
                                        {courseResourceStats.resourceCount}
                                    </p>
                                    <p className="mb-2 text-xl font-medium">
                                        Resources
                                    </p>
                                    <MonthlyGrowthBadge
                                        growthAmount={
                                            courseResourceStats.newResourceThisMonthCount
                                        }
                                    />
                                </div>
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-2 font-medium">
                            Most popular courses this month
                        </p>
                        <div
                            className={cn(
                                "flex h-96 flex-col gap-4 overflow-y-auto",
                                popularCourses.length === 0 &&
                                    "items-center justify-center",
                            )}
                        >
                            {popularCourses.length === 0 && (
                                <>
                                    <Meh className="text-primary/70 block size-10" />
                                    <p>No courses to show this month.</p>
                                </>
                            )}
                            {popularCourses.map((course) => (
                                <MostPopularCourseCard
                                    course={course}
                                    key={course.id}
                                />
                            ))}
                        </div>
                    </CardContent>
                </>
            )}
        </Card>
    );
};
