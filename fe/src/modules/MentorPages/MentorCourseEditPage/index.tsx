import { ArrowLeft } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { CourseForm } from "@/common/components/courses/course-form";
import LoadingSpinner from "@/common/components/loading-spinner";
import { PATH } from "@/common/constants/paths";
import { useCourse } from "@/common/hooks/use-course";
import type { CourseFormData } from "@/common/types/course";

import { useEditCourse } from "./hooks/use-edit-course";

export const MentorCourseEditPage = () => {
    const { id = "" } = useParams();
    const { course, isPending, error } = useCourse(id);

    const { edit, isPending: isEditPending } = useEditCourse();

    const navigate = useNavigate();

    function onSubmit(values: CourseFormData) {
        edit(
            { courseId: id, data: values },
            { onSuccess: () => navigate(`/mentor/my-courses/${id}`) },
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <Link
                        to={PATH.MentorViewCourses}
                        className="hover:text-primary/75 flex items-center gap-1"
                    >
                        <ArrowLeft className="mr-2 size-4" /> Back to my courses
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
                    <div className="flex flex-col gap-6 p-6">
                        <CourseForm
                            course={course}
                            onSubmit={onSubmit}
                            isLoading={isEditPending}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
