import { ExternalLink, Users } from "lucide-react";
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

type UserStatisticsCardProps = {
    userStats?: UserStats;
    isLoading: boolean;
    isError: boolean;
};

export const UserStatisticsCard = (props: UserStatisticsCardProps) => {
    const { userStats, isLoading, isError } = props;

    return (
        <Card>
            {isLoading && <LoadingSpinner className="m-auto" />}
            {isError && (
                <p className="m-auto">
                    Failed to load user statistics. Please come back later.
                </p>
            )}
            {userStats && (
                <>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-6">
                            <div className="bg-success-background rounded-sm p-2">
                                <Users className="text-success size-6 shrink-0 self-center" />
                            </div>
                            <div>
                                <p className="text-4xl font-bold">
                                    {userStats.activeUserCount}
                                </p>
                                <p className="mb-2 text-xl font-medium">
                                    Active users
                                </p>
                                <MonthlyGrowthBadge
                                    growthAmount={userStats.newUsersThisMonth}
                                />
                            </div>
                        </CardTitle>
                        <CardAction>
                            <Button
                                asChild
                                variant="outline"
                                className="ml-auto text-sm"
                            >
                                <Link to="/admin/manage-users">
                                    <ExternalLink className="mr-2 size-4" />
                                    All users
                                </Link>
                            </Button>
                        </CardAction>
                    </CardHeader>
                    <CardContent className="mt-auto">
                        <div className="mt-4 flex justify-between gap-2">
                            <div>
                                <p className="text-2xl font-medium">
                                    {userStats.activeAdminCount}
                                </p>
                                <p className="font-medium">Admin(s)</p>
                            </div>
                            <div>
                                <p className="text-2xl font-medium">
                                    {userStats.activeMentorCount}
                                </p>
                                <p className="font-medium">Mentor(s)</p>
                            </div>
                            <div>
                                <p className="text-2xl font-medium">
                                    {userStats.activeLearnerCount}
                                </p>
                                <p className="font-medium">Learner(s)</p>
                            </div>
                        </div>
                    </CardContent>
                </>
            )}
        </Card>
    );
};
