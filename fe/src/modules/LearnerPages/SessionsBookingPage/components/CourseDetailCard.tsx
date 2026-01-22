import { BookOpen } from "lucide-react";

import { Badge } from "@/common/components/ui/badge";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/common/components/ui/card";

import type { CourseDisplay } from "../types";

type CourseDetailCardProps = {
    course: CourseDisplay;
};

export const CourseDetailCard = ({ course }: CourseDetailCardProps) => {
    return (
        <Card className="overflow-hidden transition-colors dark:border-gray-800">
            <CardHeader className="border-b transition-colors dark:border-gray-700">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="mb-2 text-2xl font-bold break-all text-gray-800 transition-colors dark:text-gray-100">
                            {course.title}
                        </CardTitle>
                        <p className="leading-relaxed break-all text-gray-600 transition-colors dark:text-gray-300">
                            {course.description}
                        </p>
                    </div>
                    <BookOpen className="ml-4 h-8 w-8 flex-shrink-0 text-blue-500 transition-colors dark:text-blue-400" />
                </div>
            </CardHeader>

            <CardContent className="p-6 transition-colors">
                {/* Course Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-blue-50 p-3 text-center transition-colors dark:bg-blue-900/30">
                        <p className="text-xs text-gray-500 transition-colors dark:text-gray-400">
                            Category
                        </p>
                        <Badge
                            variant="outline"
                            className="mb-2 border-blue-200 text-blue-700 transition-colors dark:border-blue-700 dark:text-blue-300"
                        >
                            {course.category}
                        </Badge>
                    </div>

                    <div className="rounded-lg bg-purple-50 p-3 text-center transition-colors dark:bg-purple-900/30">
                        <p className="text-xs text-gray-500 transition-colors dark:text-gray-400">
                            Level
                        </p>
                        <Badge
                            variant="outline"
                            className="mb-2 border-purple-200 text-purple-700 transition-colors dark:border-purple-700 dark:text-purple-300"
                        >
                            {course.level}
                        </Badge>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
