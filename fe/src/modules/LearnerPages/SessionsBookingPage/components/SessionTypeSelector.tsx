import { MapPin, User, Video } from "lucide-react";

import { Button } from "@/common/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/common/components/ui/card";

import { SessionType, type SessionTypeOption } from "../types";

type SessionTypeSelectorProps = {
    sessionType: SessionType;
    onSessionTypeChange: (type: SessionType) => void;
};

export const SessionTypeSelector = ({
    sessionType,
    onSessionTypeChange,
}: SessionTypeSelectorProps) => {
    const sessionTypeOptions: SessionTypeOption[] = [
        {
            value: SessionType.Virtual,
            label: "Virtual Meeting",
            icon: Video,
            description: "Join via video call",
        },
        {
            value: SessionType.InPerson,
            label: "In-Person Meeting",
            icon: User,
            description: "Meet at agreed location",
        },
        {
            value: SessionType.OnSite,
            label: "On-Site Meeting",
            icon: MapPin,
            description: "Meet at agreed location",
        },
    ];

    return (
        <Card className="shadow-md transition-colors dark:border-gray-800 dark:shadow-gray-900/20">
            <CardHeader className="border-b pb-3 transition-colors dark:border-gray-700">
                <CardTitle className="text-base font-bold transition-colors dark:text-gray-100">
                    Select Session Type
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6transition-colors">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {sessionTypeOptions.map((option) => (
                        <Button
                            key={option.value}
                            variant={
                                sessionType === option.value
                                    ? "default"
                                    : "outline"
                            }
                            onClick={() => onSessionTypeChange(option.value)}
                            className={`flex h-auto flex-col items-center justify-center gap-3 p-6 text-center ${
                                sessionType === option.value
                                    ? "bg-blue-600 text-white dark:bg-blue-700"
                                    : "hover:bg-blue-50 dark:border-gray-700 dark:hover:bg-blue-900/20"
                            } transition-colors`}
                        >
                            <option.icon
                                className={`h-8 w-8 ${
                                    sessionType === option.value
                                        ? "text-white"
                                        : "text-blue-600 dark:text-blue-400"
                                } transition-colors`}
                            />
                            <div>
                                <div className="font-semibold">
                                    {option.label}
                                </div>
                                {option.description && (
                                    <p
                                        className={`mt-1 text-xs ${
                                            sessionType === option.value
                                                ? "text-blue-100 dark:text-blue-200"
                                                : "text-gray-500 dark:text-gray-400"
                                        } transition-colors`}
                                    >
                                        {option.description}
                                    </p>
                                )}
                            </div>
                        </Button>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};
