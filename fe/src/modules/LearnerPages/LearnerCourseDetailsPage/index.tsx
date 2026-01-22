import { AvatarFallback } from "@radix-ui/react-avatar";
import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { CategoryBadge } from "@/common/components/courses/category-badge";
import { CourseLevelBadge } from "@/common/components/courses/course-level-badge";
import { LearnerCountBadge } from "@/common/components/courses/learner-count-badge";
import LoadingSpinner from "@/common/components/loading-spinner";
import { ResourceItem } from "@/common/components/resources/resource-item";
import { Avatar, AvatarImage } from "@/common/components/ui/avatar";
import { useCourse } from "@/common/hooks/use-course";

export const LearnerCourseDetailsPage = () => {
    const { id = "" } = useParams();
    const { course, isPending, error } = useCourse(id);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <Link
                        to={"/learner/courses"}
                        className="hover:text-primary/75 flex items-center gap-1"
                    >
                        <ArrowLeft className="mr-2 size-4" /> Back to courses
                    </Link>
                </div>
            </div>

            <div className="rounded-lg border shadow-sm">
                {isPending && (
                    <div className="flex items-center justify-center p-6">
                        <LoadingSpinner />
                    </div>
                )}

                {course === null && (
                    <div className="flex items-center justify-center p-6">
                        <p>Course not found</p>
                    </div>
                )}

                {error && (
                    <div className="flex items-center justify-center p-6">
                        <p>An error happened. Please try again later.</p>
                    </div>
                )}

                {course && (
                    <div className="flex flex-col gap-6 p-6 wrap-break-word">
                        <div className="flex flex-col gap-2">
                            <h1 className="text-3xl font-bold tracking-tight">
                                {course.title}
                            </h1>

                            <div className="my-4 flex flex-wrap gap-4">
                                <CategoryBadge
                                    categoryName={course.category.name}
                                />
                                <CourseLevelBadge level={course.level} />
                                <LearnerCountBadge
                                    learnerCount={course.learnerCount}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <h2 className="text-2xl font-bold tracking-tight">
                                Course description
                            </h2>
                            <p>{course.description}</p>
                        </div>

                        <div className="flex flex-col gap-2">
                            <h2 className="text-2xl font-bold tracking-tight">
                                Course mentor
                            </h2>
                            <div className="flex items-center gap-2">
                                <Avatar>
                                    <AvatarImage
                                        src={course.mentor.avatarUrl || ""}
                                    />
                                    <AvatarFallback className="bg-primary/25 flex w-full items-center justify-center">
                                        {course.mentor.fullName
                                            .slice(0, 2)
                                            .toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <p className="font-bold">
                                    {course.mentor.fullName}
                                </p>
                            </div>
                            <p className="italic">
                                {course.mentor.experience
                                    ? `"${course.mentor.experience}"`
                                    : ""}
                            </p>
                        </div>

                        <div className="flex flex-col gap-2">
                            <h2 className="text-2xl font-bold tracking-tight">
                                Course resources
                            </h2>

                            {!course.hasAccessResourcePermission ? (
                                <p className="text-primary/75">
                                    You must enroll in the course to access the
                                    resources.
                                </p>
                            ) : (
                                course.resources.length === 0 && (
                                    <p className="text-primary/75">
                                        This course has no resources.
                                    </p>
                                )
                            )}

                            {course.resources.map((resource) => (
                                <ResourceItem
                                    resource={resource}
                                    key={resource.id}
                                    enableDownload
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
