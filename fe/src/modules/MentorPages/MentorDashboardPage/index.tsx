import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Bell, BookOpen, Clock, Users } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/common/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/common/components/ui/card";
import { Skeleton } from "@/common/components/ui/skeleton";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/common/components/ui/tooltip";
import { courseServices } from "@/common/services/courseServices";
import { notificationServices } from "@/common/services/notificationServices";
import { sessionServices } from "@/common/services/sessionServices";

import { formatSessionTime } from "./utils/timeFormat";

export function MentorDashboardPage() {
    const { data: coursesData, isPending: isLoadingCourses } = useQuery({
        queryKey: ["mentor-top-courses"],
        queryFn: () => courseServices.getTopCourses(),
    });

    const { data: sessionsData, isPending: isLoadingSessions } = useQuery({
        queryKey: ["mentor-upcoming-sessions"],
        queryFn: () => sessionServices.getUpcomingSessions(),
    });

    const { data: notificationsData, isPending: isLoadingNotifications } =
        useQuery({
            queryKey: ["mentor-notifications"],
            queryFn: () => notificationServices.get(),
        });

    const getSessionTypeBadge = (type: number) => {
        const typeMap = [
            {
                text: "Virtual",
                className: "bg-blue-100 text-blue-800",
            },
            {
                text: "In-Person",
                className: "bg-green-100 text-green-800",
            },
            {
                text: "On-Site",
                className: "bg-purple-100 text-purple-800",
            },
        ];

        const { text, className } = typeMap[type] || {
            text: type,
            className: "bg-gray-100 text-gray-800",
        };

        return (
            <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}
            >
                {text}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Dashboard
                    </h1>
                    <p className="text-muted-foreground">
                        Welcome back! Here's what's happening with your courses
                        and sessions.
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="md:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div>
                            <CardTitle className="text-lg font-medium">
                                My Courses
                            </CardTitle>
                            <CardDescription>
                                Top courses by number of learners
                            </CardDescription>
                        </div>
                        <BookOpen className="text-muted-foreground h-5 w-5" />
                    </CardHeader>
                    <CardContent>
                        {isLoadingCourses ? (
                            <div className="space-y-4">
                                {[...Array(3)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center justify-between"
                                    >
                                        <Skeleton className="h-4 w-3/4" />
                                        <Skeleton className="h-4 w-10" />
                                    </div>
                                ))}
                            </div>
                        ) : coursesData?.data?.length ? (
                            <div className="space-y-4">
                                {coursesData.data
                                    .filter((_, index) => index < 5)
                                    .map((course) => (
                                        <div
                                            key={course.id}
                                            className="flex items-center justify-between"
                                        >
                                            <div className="space-y-1">
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Link
                                                                to={`/mentor/my-courses/${course.id}`}
                                                                className="block max-w-[600px] truncate font-medium hover:underline"
                                                                title={
                                                                    course.title
                                                                }
                                                            >
                                                                {course.title}
                                                            </Link>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p className="max-w-sm break-words">
                                                                {course.title}
                                                            </p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                                <span className="text-muted-foreground text-xs">
                                                    {course.categoryName}
                                                </span>
                                            </div>
                                            <div className="text-muted-foreground flex items-center text-sm">
                                                <Users className="mr-1 h-4 w-4" />
                                                {course.learnerCount} learners
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-sm">
                                No courses found
                            </p>
                        )}
                    </CardContent>
                    <CardFooter>
                        <Button variant="ghost" className="w-full" asChild>
                            <Link to="/mentor/my-courses">
                                View all courses{" "}
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div>
                            <CardTitle className="text-lg font-medium">
                                Upcoming Sessions
                            </CardTitle>
                            <CardDescription>Next 24 hours</CardDescription>
                        </div>
                        <Clock className="text-muted-foreground h-5 w-5" />
                    </CardHeader>
                    <CardContent>
                        {isLoadingSessions ? (
                            <div className="space-y-4">
                                {[...Array(2)].map((_, i) => (
                                    <div key={i} className="space-y-2">
                                        <Skeleton className="h-4 w-3/4" />
                                        <Skeleton className="h-3 w-1/2" />
                                    </div>
                                ))}
                            </div>
                        ) : (sessionsData?.data?.length ?? 0 > 0) ? (
                            <div className="space-y-4">
                                {sessionsData?.data
                                    ?.filter((_, index) => index < 5)
                                    .map((session) => (
                                        <div
                                            key={session.id}
                                            className="space-y-1"
                                        >
                                            <div className="flex items-center justify-between">
                                                <b>{session.course.title}</b>
                                                {getSessionTypeBadge(
                                                    session.sessionType,
                                                )}
                                            </div>
                                            <div className="text-muted-foreground text-sm">
                                                {formatSessionTime(
                                                    session.schedule.startTime,
                                                )}{" "}
                                                • {session.studentName}
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-sm">
                                No upcoming sessions
                            </p>
                        )}
                    </CardContent>
                    <CardFooter>
                        <Button variant="ghost" className="w-full" asChild>
                            <Link to="/mentor/sessions">
                                View all sessions{" "}
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div>
                        <CardTitle className="text-lg font-medium">
                            Notifications
                        </CardTitle>
                        <CardDescription>
                            Recent updates and alerts
                        </CardDescription>
                    </div>
                    <Bell className="text-muted-foreground h-5 w-5" />
                </CardHeader>
                <CardContent>
                    {isLoadingNotifications ? (
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="space-y-2">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-3 w-full" />
                                    <Skeleton className="h-3 w-1/2" />
                                </div>
                            ))}
                        </div>
                    ) : (notificationsData?.data || []).length > 0 ? (
                        <div className="space-y-4">
                            {notificationsData?.data?.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={"rounded-lg p-3"}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-medium">
                                                    {notification.title}
                                                </h4>
                                            </div>
                                            <p className="text-muted-foreground text-sm">
                                                {notification.message}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-sm">
                            No new notifications
                        </p>
                    )}
                </CardContent>
                <CardFooter>
                    <Button variant="ghost" className="w-full">
                        View all notifications{" "}
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}

export default MentorDashboardPage;
