import { Calendar, Check, Clock, Home, User, Video } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/common/components/ui/button";
import { Card, CardContent } from "@/common/components/ui/card";

import { type MentorDisplay, type SelectedSlot, SessionType } from "../types";
import { getCurrentTimeZone } from "../utils/dateTimeUtils";

type BookingConfirmationProps = {
    mentor: MentorDisplay;
    selectedSlot: SelectedSlot;
    sessionType: SessionType;
};

export const BookingConfirmation = ({
    mentor,
    selectedSlot,
    sessionType,
}: BookingConfirmationProps) => {
    const navigate = useNavigate();
    const formatDate = (date: Date) => {
        const options: Intl.DateTimeFormatOptions = {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        };
        return date.toLocaleDateString("en-US", options);
    };

    const formatTimeRange = (timeStr: string) => {
        return timeStr;
    };

    // Get session type icon and label
    const getSessionTypeInfo = () => {
        switch (sessionType) {
            case SessionType.Virtual:
                return {
                    icon: (
                        <Video className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    ),
                    label: "Virtual Meeting",
                };
            case SessionType.InPerson:
                return {
                    icon: (
                        <User className="h-5 w-5 text-green-600 dark:text-green-400" />
                    ),
                    label: "In-Person Meeting",
                };
            case SessionType.OnSite:
                return {
                    icon: (
                        <Home className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    ),
                    label: "On-Site Session Meeting",
                };
            default:
                return {
                    icon: (
                        <Video className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    ),
                    label: "Virtual Meeting",
                };
        }
    };

    const sessionTypeInfo = getSessionTypeInfo();
    const currentTimeZone = getCurrentTimeZone();

    return (
        <div className="min-h-screen px-4 py-8 transition-colors">
            <div className="mx-auto max-w-4xl">
                {/* Success Header */}
                <div className="mb-8 rounded-lg bg-gray-500 bg-gradient-to-r p-8 text-white shadow-lg dark:bg-gray-700">
                    <div className="flex items-center justify-center gap-6">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white dark:bg-gray-100">
                            <Check className="h-8 w-8 text-green-600" />
                        </div>
                        <div className="text-center">
                            <h1 className="mb-2 text-3xl font-bold">
                                Booking successful!
                            </h1>
                            <p className="text-lg text-green-100">
                                Session with {mentor.fullName} has been
                                scheduled. You will receive a confirmation email
                                shortly.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Session Details */}
                <Card className="mb-8 shadow-lg">
                    <CardContent className="p-8">
                        <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-100">
                            Session Details
                        </h2>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="flex items-start gap-4 rounded-lg border p-4 transition-colors dark:border-gray-700">
                                <Calendar className="mt-1 h-6 w-6 text-gray-500 dark:text-gray-400" />
                                <div>
                                    <p className="mb-1 font-semibold text-gray-800 dark:text-gray-200">
                                        Date
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        {formatDate(selectedSlot.dateObj)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 rounded-lg border p-4 transition-colors dark:border-gray-700">
                                <Clock className="mt-1 h-6 w-6 text-gray-500 dark:text-gray-400" />
                                <div>
                                    <p className="mb-1 font-semibold text-gray-800 dark:text-gray-200">
                                        Time
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        {formatTimeRange(selectedSlot.time)}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-500">
                                        Timezone: {currentTimeZone}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 rounded-lg border p-4 transition-colors dark:border-gray-700">
                                <div className="mt-1">
                                    {sessionTypeInfo.icon}
                                </div>
                                <div>
                                    <p className="mb-1 font-semibold text-gray-800 dark:text-gray-200">
                                        Session Type
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        {sessionTypeInfo.label}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 rounded-lg border p-4 transition-colors dark:border-gray-700">
                                <User className="mt-1 h-6 w-6 text-gray-500 dark:text-gray-400" />
                                <div>
                                    <p className="mb-1 font-semibold text-gray-800 dark:text-gray-200">
                                        Mentor
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        {mentor.fullName}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Action Button */}
                <div className="flex flex-col justify-center gap-4 sm:flex-row">
                    <Button
                        onClick={() => navigate("/learner/courses")}
                        size="lg"
                        className="px-8 py-3 text-lg font-medium transition-colors"
                    >
                        Book another session
                    </Button>
                    <Button
                        onClick={() => navigate("/learner/dashboard")}
                        size="lg"
                        variant="outline"
                        className="px-8 py-3 text-lg font-medium transition-colors"
                    >
                        <Home className="mr-2 h-4 w-4" />
                        Dashboard
                    </Button>
                </div>
            </div>
        </div>
    );
};
