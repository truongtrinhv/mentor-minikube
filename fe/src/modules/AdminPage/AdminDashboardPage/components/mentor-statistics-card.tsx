import { CircleAlert, ExternalLink, Folder } from "lucide-react";
import { Link } from "react-router-dom";

import LoadingSpinner from "@/common/components/loading-spinner";
import { Button } from "@/common/components/ui/button";
import {
    Card,
    CardAction,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/common/components/ui/card";

import { MonthlyGrowthBadge } from "./monthly-growth-badge";

import type { UserStats } from "../types";

type MentorStatisticsCardProps = {
    userStats?: UserStats;
    isLoading: boolean;
    isError: boolean;
};

export const MentorStatisticsCard = (props: MentorStatisticsCardProps) => {
    const { userStats, isLoading, isError } = props;

    return (
        <Card>
            {isLoading && <LoadingSpinner className="m-auto" />}
            {isError && (
                <p className="m-auto">
                    Failed to load mentor statistics. Please come back later.
                </p>
            )}
            {userStats && (
                <>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-6">
                            <div className="bg-warning-background rounded-sm p-2">
                                <Folder className="text-warning size-6 shrink-0 self-center" />
                            </div>
                            <div>
                                <p className="flex items-center gap-2 text-4xl font-bold">
                                    {userStats.pendingApplicationsCount}
                                    {userStats.pendingApplicationsCount > 0 && (
                                        <CircleAlert className="text-warning" />
                                    )}
                                </p>
                                <p className="mb-2 text-xl font-medium">
                                    Applications pending or under review
                                </p>
                                <MonthlyGrowthBadge
                                    growthAmount={
                                        userStats.pendingApplicationsThisMonth
                                    }
                                />
                            </div>
                        </CardTitle>
                        <CardAction>
                            <Button
                                asChild
                                variant="outline"
                                className="ml-auto self-start"
                            >
                                <Link to="/admin/mentor-approvals">
                                    <ExternalLink className="mr-2 size-4" />
                                    All applications
                                </Link>
                            </Button>
                        </CardAction>
                    </CardHeader>
                    <CardContent className="mt-auto">
                        <div className="mt-4 flex justify-between gap-2">
                            <div>
                                <p className="text-2xl font-medium">
                                    {userStats.activeUnapprovedMentorCount}
                                </p>
                                <p className="font-medium">Mentors pending</p>
                            </div>
                            <div>
                                <p className="text-2xl font-medium">
                                    {userStats.activeApprovedMentorCount}
                                </p>
                                <p className="font-medium">Mentors approved</p>
                            </div>
                        </div>
                    </CardContent>
                </>
            )}
        </Card>
    );
};
