import { BookOpen, Calendar, CheckCircle } from "lucide-react";
import React from "react";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/common/components/ui/card";

import type { DashboardStats } from "../types";

type DashboardStatsProps = {
    stats: DashboardStats;
};

export const DashboardStatsComponent: React.FC<DashboardStatsProps> = ({
    stats,
}) => {
    const statItems = [
        {
            title: "Enrolled courses",
            value: stats.totalEnrolledCourses,
            icon: BookOpen,
            color: "text-blue-600 dark:text-blue-400",
            bgColor: "bg-blue-50 dark:bg-blue-950/20",
        },
        {
            title: "Upcoming sessions",
            value: stats.totalUpcomingSessions,
            icon: Calendar,
            color: "text-green-600 dark:text-green-400",
            bgColor: "bg-green-50 dark:bg-green-950/20",
        },
        {
            title: "Completed sessions",
            value: stats.totalCompletedSessions,
            icon: CheckCircle,
            color: "text-purple-600 dark:text-purple-400",
            bgColor: "bg-purple-50 dark:bg-purple-950/20",
        },
    ];

    return (
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {statItems.map((item, index) => {
                const Icon = item.icon;
                return (
                    <Card
                        key={index}
                        className="transition-shadow hover:shadow-md"
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xl font-medium text-gray-600 dark:text-gray-400">
                                {item.title}
                            </CardTitle>
                            <div className={`rounded-lg p-2 ${item.bgColor}`}>
                                <Icon className={`h-6 w-6 ${item.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-extrabold text-gray-900 dark:text-white">
                                {item.value}
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
};
