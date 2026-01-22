import { CourseResourceStatisticsCard } from "./components/course-resource-stats-card";
import { MentorStatisticsCard } from "./components/mentor-statistics-card";
import { SessionStatisticsCard } from "./components/session-statistics-card";
import { UserStatisticsCard } from "./components/user-statistics-card";
import { useCourseAndResourceStats } from "./hooks/use-course-and-resource-stats";
import { useMostPopularCourses } from "./hooks/use-most-popular-courses";
import { useSessionStats } from "./hooks/use-session-stats";
import { useUserStats } from "./hooks/use-user-stats";

export const AdminDashboardPage = () => {
    const {
        userStats,
        isPending: isUserStatsPending,
        isError: isUserStatsError,
    } = useUserStats();

    const {
        courseResourceStats,
        isPending: isCourseResourceStatsPending,
        isError: isCourseResourceStatsError,
    } = useCourseAndResourceStats();

    const {
        sessionStats,
        isPending: isSessionStatsPending,
        isError: isSessionStatsError,
    } = useSessionStats();

    const {
        courses,
        isPending: isCoursesPending,
        isError: isCoursesError,
    } = useMostPopularCourses();

    return (
        <div className="space-y-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Dashboard
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Welcome back! Monitor the system.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                <UserStatisticsCard
                    userStats={userStats}
                    isLoading={isUserStatsPending}
                    isError={isUserStatsError}
                />

                <MentorStatisticsCard
                    userStats={userStats}
                    isLoading={isUserStatsPending}
                    isError={isUserStatsError}
                />

                <CourseResourceStatisticsCard
                    courseResourceStats={courseResourceStats}
                    popularCourses={courses}
                    isLoading={isCourseResourceStatsPending || isCoursesPending}
                    isError={isCourseResourceStatsError || isCoursesError}
                />

                <SessionStatisticsCard
                    sessionStats={sessionStats}
                    isLoading={isSessionStatsPending}
                    isError={isSessionStatsError}
                />
            </div>
        </div>
    );
};
