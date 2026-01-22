import { BookOpen, MessageCircle } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
    CardFooter,
    CardHeader,
} from "@/common/components/ui/card";

import { MentorDetailModal } from "./MentorDetailModal";

import { type MentorWithCourses } from "../types";

type MentorCardProps = {
    mentor: MentorWithCourses;
    onBookMentor: (mentorId: string) => void;
};

export const MentorCard: React.FC<MentorCardProps> = ({
    mentor,
    onBookMentor,
}) => {
    const [showDetailModal, setShowDetailModal] = useState(false);
    const navigate = useNavigate();

    return (
        <>
            <Card className="flex h-full flex-col transition-shadow duration-200 hover:shadow-lg">
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                            <AvatarImage
                                src={mentor.avatarUrl}
                                alt={mentor.fullName}
                            />
                            <AvatarFallback className="text-lg">
                                {mentor.fullName
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                            <h3 className="truncate text-lg font-semibold text-gray-900 dark:text-white">
                                {mentor.fullName}
                            </h3>
                            <p className="truncate text-sm text-gray-600 dark:text-gray-400">
                                {mentor.email}
                            </p>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="flex-1">
                    {/* Bio */}
                    {mentor.bio && (
                        <div className="mb-4">
                            <p className="line-clamp-3 text-sm text-gray-600 dark:text-gray-400">
                                {mentor.bio}
                            </p>
                        </div>
                    )}

                    {/* Expertise */}
                    {mentor.expertise && mentor.expertise.length > 0 && (
                        <div className="mb-4">
                            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                Expertise:
                            </p>
                            <div className="flex flex-wrap gap-1">
                                {mentor.expertise
                                    .slice(0, 4)
                                    .map((skill, index) => (
                                        <Badge
                                            key={index}
                                            variant="secondary"
                                            className="text-xs"
                                        >
                                            {skill}
                                        </Badge>
                                    ))}
                                {mentor.expertise.length > 4 && (
                                    <Badge
                                        variant="secondary"
                                        className="text-xs"
                                    >
                                        +{mentor.expertise.length - 4}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Courses */}
                    {mentor.courses && mentor.courses.length > 0 && (
                        <div>
                            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                Courses ({mentor.courses.length}):
                            </p>
                            <div className="space-y-2">
                                {mentor.courses.slice(0, 2).map((course) => (
                                    <div
                                        key={course.id}
                                        className="flex items-center gap-2 rounded-md bg-gray-50 p-2 dark:bg-gray-800"
                                    >
                                        <BookOpen className="h-4 w-4 flex-shrink-0 text-gray-400" />
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                                                {course.title}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {course.category.name}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                {mentor.courses.length > 2 && (
                                    <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                                        +{mentor.courses.length - 2} more
                                        courses
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>

                <CardFooter className="pt-4">
                    <div className="flex w-full gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => setShowDetailModal(true)}
                        >
                            View details
                        </Button>
                        <Button
                            size="sm"
                            className="flex-1"
                            onClick={() =>
                                navigate(`/learner/messages/${mentor.id}`)
                            }
                        >
                            <MessageCircle className="mr-1 h-4 w-4" />
                            Message
                        </Button>
                    </div>
                </CardFooter>
            </Card>

            {/* Detail Modal */}
            <MentorDetailModal
                mentor={mentor}
                isOpen={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                onBookMentor={onBookMentor}
            />
        </>
    );
};
