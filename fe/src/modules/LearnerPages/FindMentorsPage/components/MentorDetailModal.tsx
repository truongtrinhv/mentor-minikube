import { useState } from "react";

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/common/components/ui/avatar";
import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/common/components/ui/dialog";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/common/components/ui/tabs";

import { type MentorWithCourses } from "../types";

type MentorDetailModalProps = {
    mentor: MentorWithCourses;
    isOpen: boolean;
    onClose: () => void;
    onBookMentor: (mentorId: string) => void;
};

export const MentorDetailModal: React.FC<MentorDetailModalProps> = ({
    mentor,
    isOpen,
    onClose,
    onBookMentor,
}) => {
    const [activeTab, setActiveTab] = useState<"about" | "courses">("about");

    const handleBookSession = () => {
        onBookMentor(mentor.id);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
                <DialogHeader className="mb-6">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                            Mentor Profile
                        </DialogTitle>
                    </div>
                </DialogHeader>

                {/* Mentor basic info */}
                <div className="mb-8 flex flex-col gap-6 md:flex-row">
                    <div className="flex-shrink-0">
                        <Avatar className="h-32 w-32 border-4 border-white shadow-lg dark:border-gray-800">
                            <AvatarImage
                                src={mentor.avatarUrl}
                                alt={mentor.fullName}
                                className="object-cover"
                            />
                            <AvatarFallback className="text-3xl">
                                {mentor.fullName
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                    </div>

                    <div className="flex-1">
                        <h2 className="mb-1 text-2xl font-bold text-gray-900 dark:text-white">
                            {mentor.fullName}
                        </h2>
                        <p className="mb-3 text-gray-600 dark:text-gray-400">
                            {mentor.email}
                        </p>

                        <div className="mt-3">
                            <div className="mb-4 flex flex-wrap gap-1">
                                {mentor.expertise.map((skill, index) => (
                                    <Badge
                                        key={index}
                                        variant="secondary"
                                        className="text-xs"
                                    >
                                        {skill}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <Tabs
                    defaultValue="about"
                    value={activeTab}
                    onValueChange={(value) =>
                        setActiveTab(value as "about" | "courses")
                    }
                    className="mt-6"
                >
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="about">About</TabsTrigger>
                        <TabsTrigger value="courses">
                            Courses ({mentor.courses.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="about" className="mt-4">
                        <div className="space-y-4">
                            <div>
                                <h3 className="mb-2 text-lg font-semibold">
                                    Bio
                                </h3>
                                <p className="mb-5 break-all text-gray-600 dark:text-gray-400">
                                    {mentor.bio || "No bio available."}
                                </p>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="courses" className="mt-4">
                        <div className="space-y-6">
                            {mentor.courses.map((course) => (
                                <div
                                    key={course.id}
                                    className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                                >
                                    <div className="mb-3 flex items-start justify-between">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {course.title}
                                        </h3>
                                    </div>

                                    <p className="mb-4 break-all text-gray-600 dark:text-gray-400">
                                        {course.description}
                                    </p>

                                    <div className="flex justify-end border-t border-gray-200 pt-4 dark:border-gray-700">
                                        <Button
                                            onClick={handleBookSession}
                                            className="rounded-lg px-6 py-2 font-medium shadow-sm transition-all duration-200 hover:shadow-md"
                                        >
                                            Book Session
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
};
