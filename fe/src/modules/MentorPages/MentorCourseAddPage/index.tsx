import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { CourseForm } from "@/common/components/courses/course-form";
import { PATH } from "@/common/constants/paths";
import type { CourseFormData } from "@/common/types/course";

import { useAddCourse } from "./hooks/use-add-course";

export function MentorCourseAddPage() {
    const { create, isPending } = useAddCourse();
    const navigate = useNavigate();

    function onSubmit(values: CourseFormData) {
        create(values, { onSuccess: () => navigate(PATH.MentorViewCourses) });
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
                    <h1 className="text-3xl font-bold tracking-tight">
                        Add a new course
                    </h1>
                    <p className="text-gray-500">
                        Ready to teach and inspire others?
                    </p>
                </div>
            </div>

            <div className="rounded-lg border shadow-sm">
                <div className="p-6">
                    <CourseForm onSubmit={onSubmit} isLoading={isPending} />
                </div>
            </div>
        </div>
    );
}
