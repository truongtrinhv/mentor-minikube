/* eslint-disable @typescript-eslint/no-explicit-any */
import { Alert, AlertDescription } from "@/common/components/ui/alert";
import { Skeleton } from "@/common/components/ui/skeleton";

import { DashboardStatsComponent } from "./components/dashboard-stats";
import { EnrolledCourses } from "./components/enrolled-courses";
import { UpcomingSessions } from "./components/upcoming-sessions";
import {
    useDashboardStats,
    useEnrolledCourses,
    useUpcomingSessions,
} from "./hooks/useDashboardStats";
import type { DashboardStats, EnrolledCourse, UpcomingSession } from "./types";

function isDashboardStats(obj: any): obj is DashboardStats {
    return (
        obj &&
        typeof obj === "object" &&
        typeof obj.totalEnrolledCourses === "number" &&
        typeof obj.totalUpcomingSessions === "number" &&
        typeof obj.totalCompletedSessions === "number"
    );
}

function isEnrolledCourses(obj: any): obj is EnrolledCourse[] {
    return (
        obj &&
        Array.isArray(obj) &&
        obj.every((course) => typeof course === "object")
    );
}

function isUpcomingSessions(obj: any): obj is UpcomingSession[] {
    return (
        obj &&
        Array.isArray(obj) &&
        obj.every((session) => typeof session === "object")
    );
}

export function DashboardPage() {
    const {
        data: stats,
        isLoading,
        error,
        refetch,
        isRefetching,
    } = useDashboardStats();

    const {
        data: upcomingSessions,
        isLoading: isLoadingSessions,
        error: sessionsError,
        refetch: refetchSessions,
        isRefetching: isRefetchingSessions,
    } = useUpcomingSessions();

    console.log(upcomingSessions);

    const {
        data: enrolledCourses,
        isLoading: isLoadingCourses,
        error: coursesError,
        refetch: refetchCourses,
        isRefetching: isRefetchingCourses,
    } = useEnrolledCourses();

    console.log(enrolledCourses);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Dashboard
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Welcome back! Track your learning progress.
                </p>
            </div>

            {/* Dashboard Stats */}
            {error ? (
                <Alert variant="destructive">
                    <AlertDescription>
                        {error.message || "Failed to load dashboard statistics"}
                        <button
                            onClick={() => refetch()}
                            className="ml-2 underline hover:no-underline"
                            disabled={isRefetching}
                        >
                            {isRefetching ? "Retrying..." : "Try again"}
                        </button>
                    </AlertDescription>
                </Alert>
            ) : isLoading ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-24 w-full rounded-lg" />
                    ))}
                </div>
            ) : isDashboardStats(stats) ? (
                <DashboardStatsComponent stats={stats} />
            ) : null}

            {/* Main Content Grid - Sessions and Courses */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Upcoming Sessions */}
                <div className="flex flex-col lg:col-span-1">
                    {sessionsError ? (
                        <Alert variant="destructive">
                            <AlertDescription>
                                {sessionsError.message ||
                                    "Failed to load upcoming sessions"}
                                <button
                                    onClick={() => refetchSessions()}
                                    className="ml-2 underline hover:no-underline"
                                    disabled={isRefetchingSessions}
                                >
                                    {isRefetchingSessions
                                        ? "Retrying..."
                                        : "Try again"}
                                </button>
                            </AlertDescription>
                        </Alert>
                    ) : isLoadingSessions ? (
                        <div className="h-full flex-1 rounded-lg border p-6">
                            <Skeleton className="mb-4 h-6 w-40" />
                            <div className="space-y-3">
                                {[1, 2].map((i) => (
                                    <Skeleton key={i} className="h-24 w-full" />
                                ))}
                            </div>
                        </div>
                    ) : isUpcomingSessions(upcomingSessions) ? (
                        <div className="h-full flex-1">
                            <UpcomingSessions sessions={upcomingSessions} />
                        </div>
                    ) : null}
                </div>

                {/* Enrolled Courses */}
                <div className="flex flex-col lg:col-span-1">
                    {coursesError ? (
                        <Alert variant="destructive">
                            <AlertDescription>
                                {coursesError.message ||
                                    "Failed to load enrolled courses"}
                                <button
                                    onClick={() => refetchCourses()}
                                    className="ml-2 underline hover:no-underline"
                                    disabled={isRefetchingCourses}
                                >
                                    {isRefetchingCourses
                                        ? "Retrying..."
                                        : "Try again"}
                                </button>
                            </AlertDescription>
                        </Alert>
                    ) : isLoadingCourses ? (
                        <div className="h-full flex-1 rounded-lg border p-6">
                            <Skeleton className="mb-4 h-6 w-40" />
                            <div className="space-y-3">
                                {[1, 2].map((i) => (
                                    <Skeleton key={i} className="h-24 w-full" />
                                ))}
                            </div>
                        </div>
                    ) : isEnrolledCourses(enrolledCourses) ? (
                        <div className="h-full flex-1">
                            <EnrolledCourses courses={enrolledCourses} />
                        </div>
                    ) : null}
                </div>
            </div>

            {/* Learning Tips Section */}
            <div className="rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-100 p-6 dark:border-blue-800 dark:from-blue-950/20 dark:to-indigo-950/20">
                <h3 className="mb-2 text-lg font-semibold text-blue-900 dark:text-blue-100">
                    💡 Learning tips
                </h3>
                <p className="mb-4 text-blue-700 dark:text-blue-300">
                    Spend at least 30 minutes each day to review and practice
                    what you've learned.
                </p>
                <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-white p-3 text-center dark:bg-gray-800">
                        <div className="mb-1 text-2xl">📚</div>
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Daily review
                        </div>
                    </div>
                    <div className="rounded-lg bg-white p-3 text-center dark:bg-gray-800">
                        <div className="mb-1 text-2xl">💻</div>
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Practice coding
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
