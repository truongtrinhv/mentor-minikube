import { Mail } from "lucide-react";

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/common/components/ui/avatar";
import { Badge } from "@/common/components/ui/badge";
import { Card } from "@/common/components/ui/card";

import type { MentorDisplay } from "../types";

type MentorCardProps = {
    mentor: MentorDisplay;
};

export const MentorCard = ({ mentor }: MentorCardProps) => {
    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((part) => part[0])
            .join("")
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <Card className="overflow-hidden transition-colors">
            <div className="bg-gradient-to-r p-6 transition-colors">
                <div className="flex flex-col items-center gap-4 md:flex-row">
                    <Avatar className="h-24 w-24 border-4 border-white shadow-lg dark:border-gray-200">
                        {mentor.avatarUrl ? (
                            <AvatarImage
                                src={mentor.avatarUrl}
                                alt={mentor.fullName}
                            />
                        ) : (
                            <AvatarFallback className="bg-white text-xl font-bold text-blue-600 transition-colors dark:bg-gray-200 dark:text-blue-700">
                                {getInitials(mentor.fullName)}
                            </AvatarFallback>
                        )}
                    </Avatar>
                    <div className="flex-1 text-center md:text-left">
                        <h1 className="mb-2 text-2xl font-bold">
                            {mentor.fullName}
                        </h1>
                        <div className="mb-3 flex items-center justify-center gap-2 md:justify-start">
                            <Mail className="h-4 w-4" />
                            <span className="text-sm">{mentor.email}</span>
                        </div>
                        <div className="flex flex-wrap justify-center gap-2 md:justify-start">
                            {mentor.expertise.map((skill, index) => (
                                <Badge key={index} variant="outline">
                                    {skill}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};
