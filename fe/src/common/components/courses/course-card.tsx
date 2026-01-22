import { Link } from "react-router-dom";

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/common/components/ui/avatar";
import { Button } from "@/common/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/common/components/ui/card";
import type { Course } from "@/common/types/course";

import { CategoryBadge } from "./category-badge";
import { CourseLevelBadge } from "./course-level-badge";
import { LearnerCountBadge } from "./learner-count-badge";

type CourseCardProps = {
    course: Course;
};

export const CourseCard = ({ course }: CourseCardProps) => {
    return (
        <Card className="h-full gap-4 wrap-break-word" key={course.id}>
            <CardHeader className="min-w-0">
                <CardTitle className="before:bg-primary relative inline-block w-fit max-w-full min-w-0 before:absolute before:top-full before:left-0 before:h-0.5 before:w-full before:origin-left before:scale-x-0 before:transition-transform before:duration-300 hover:before:scale-x-100">
                    <Link
                        to={`/learner/courses/${course.id}`}
                        className="line-clamp-2 pb-0.5"
                    >
                        {course.title}
                    </Link>
                </CardTitle>
                <CardDescription className="mt-4 flex min-w-0 flex-wrap gap-x-2 gap-y-1">
                    <CategoryBadge categoryName={course.category.name} />
                    <CourseLevelBadge level={course.level} />
                    <LearnerCountBadge learnerCount={course.learnerCount} />
                </CardDescription>
            </CardHeader>
            <CardContent className="mt-auto">
                <div className="flex items-center gap-2">
                    <Avatar>
                        <AvatarImage src={course.mentor.avatarUrl || ""} />
                        <AvatarFallback className="bg-primary/25 flex w-full items-center justify-center">
                            {course.mentor.fullName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <p className="line-clamp-2 text-sm font-medium">
                        {course.mentor.fullName}{" "}
                    </p>
                </div>
            </CardContent>
            <CardFooter>
                <Button>
                    <Link to={`/learner/sessions?courseId=${course.id}`}>
                        Book session
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
};
