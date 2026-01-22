import {
    Calendar,
    Clock,
    ExternalLink,
    MapPin,
    Users,
    Video,
} from "lucide-react";
import React from "react";
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

import type { UpcomingSession } from "../types";
import { RequestMentoringSessionStatus, SessionType } from "../types";
import {
    formatDateTimeLocal,
    formatSessionTimeRange,
    getTimeUntilSessionLocal,
} from "../utils/dateTimeUtils";

type UpcomingSessionsProps = {
    sessions: UpcomingSession[];
};

const getSessionTypeIcon = (type: SessionType) => {
    switch (type) {
        case SessionType.Virtual:
            return <Video className="h-4 w-4" />;
        case SessionType.InPerson:
        case SessionType.Onsite:
            return <MapPin className="h-4 w-4" />;
        default:
            return <Users className="h-4 w-4" />;
    }
};

const getSessionTypeText = (type: SessionType) => {
    switch (type) {
        case SessionType.Virtual:
            return "Virtual";
        case SessionType.InPerson:
            return "In-person";
        case SessionType.Onsite:
            return "On-site";
        default:
            return "Unknown";
    }
};

const getStatusColor = (status: RequestMentoringSessionStatus) => {
    switch (status) {
        case RequestMentoringSessionStatus.Scheduled:
            return "bg-green-100 text-green-800 dark:bg-green-950/20 dark:text-green-400";
        case RequestMentoringSessionStatus.Pending:
            return "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/20 dark:text-yellow-400";
        case RequestMentoringSessionStatus.Rescheduling:
            return "bg-orange-100 text-orange-800 dark:bg-orange-950/20 dark:text-orange-400";
        case RequestMentoringSessionStatus.Cancelled:
            return "bg-red-100 text-red-800 dark:bg-red-950/20 dark:text-red-400";
        default:
            return "bg-gray-100 text-gray-800 dark:bg-gray-950/20 dark:text-gray-400";
    }
};

const getStatusText = (status: RequestMentoringSessionStatus) => {
    switch (status) {
        case RequestMentoringSessionStatus.Scheduled:
            return "Scheduled";
        case RequestMentoringSessionStatus.Pending:
            return "Pending";
        case RequestMentoringSessionStatus.Rescheduling:
            return "Rescheduling";
        case RequestMentoringSessionStatus.Cancelled:
            return "Cancelled";
        case RequestMentoringSessionStatus.Completed:
            return "Completed";
        default:
            return "Unknown";
    }
};

export const UpcomingSessions: React.FC<UpcomingSessionsProps> = ({
    sessions,
}) => {
    const sortedSessions = sessions
        .sort(
            (a, b) =>
                new Date(a.scheduledDate).getTime() -
                new Date(b.scheduledDate).getTime(),
        )
        .slice(0, 10);
    return (
        <Card className="flex h-full flex-col">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold">
                    Upcoming sessions
                </CardTitle>
                <Link to="/learner/session-management">
                    <Button variant="outline" size="sm">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View all
                    </Button>
                </Link>
            </CardHeader>
            <CardContent className="flex-grow overflow-hidden">
                <div className="h-[350px] overflow-y-auto pr-2">
                    {sortedSessions.length === 0 ? (
                        <div className="flex h-full items-center justify-center py-8 text-center">
                            <div>
                                <Calendar className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                                <p className="text-gray-500 dark:text-gray-400">
                                    No upcoming sessions
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 pr-1">
                            {sortedSessions.map((session) => (
                                <div
                                    key={session.id}
                                    className="rounded-lg border p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                >
                                    <div className="mb-3 flex items-start justify-between">
                                        <div>
                                            <h3 className="font-medium break-all text-gray-900 dark:text-white">
                                                {session.courseTitle}
                                            </h3>
                                            <div className="mt-1 flex items-center gap-2">
                                                <Badge
                                                    className={getStatusColor(
                                                        session.status,
                                                    )}
                                                >
                                                    {getStatusText(
                                                        session.status,
                                                    )}
                                                </Badge>
                                                <Badge
                                                    variant="outline"
                                                    className="flex items-center gap-1"
                                                >
                                                    {getSessionTypeIcon(
                                                        session.sessionType,
                                                    )}
                                                    {getSessionTypeText(
                                                        session.sessionType,
                                                    )}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="text-right text-sm text-gray-500">
                                            <div>
                                                {formatDateTimeLocal(
                                                    session.scheduledDate,
                                                )}
                                            </div>
                                            <div className="font-medium text-blue-600">
                                                {getTimeUntilSessionLocal(
                                                    session.scheduledDate,
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage
                                                    src={session.mentorAvatar}
                                                    alt={session.mentorName}
                                                />
                                                <AvatarFallback>
                                                    {session.mentorName
                                                        .split(" ")
                                                        .map((n) => n[0])
                                                        .join("")}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {session.mentorName}
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                                    <Clock className="h-3 w-3" />
                                                    {formatSessionTimeRange(
                                                        session.startTime,
                                                        session.endTime,
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
