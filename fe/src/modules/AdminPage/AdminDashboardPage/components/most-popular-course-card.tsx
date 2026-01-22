import { CategoryBadge } from "@/common/components/courses/category-badge";
import { SessionCountBadge } from "@/common/components/courses/session-count-badge copy";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/common/components/ui/avatar";

import type { MostPopularCourse } from "../types";
import { getInitials } from "../utils";

type MostPopularCourseCardProps = {
    course: MostPopularCourse;
};

export const MostPopularCourseCard = ({
    course,
}: MostPopularCourseCardProps) => {
    return (
        <div className="flex flex-col gap-4">
            <div className="rounded-sm border p-4 shadow-sm">
                <p className="truncate font-medium">{course.title}</p>
                <div className="my-2 flex flex-wrap gap-x-2 gap-y-1">
                    <CategoryBadge categoryName="Programming" />
                    <SessionCountBadge sessionCount={course.sessionCount} />
                </div>
                <div className="flex items-center gap-2">
                    <Avatar>
                        <AvatarImage src={course.mentorAvatar || ""} />
                        <AvatarFallback>
                            {getInitials(course.mentorName)}
                        </AvatarFallback>
                    </Avatar>
                    <p className="truncate text-sm font-medium">
                        {course.mentorName}
                    </p>
                </div>
            </div>
        </div>
    );
};
