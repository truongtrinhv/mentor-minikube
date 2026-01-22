import { Edit, Trash } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { ConfirmDialog } from "@/common/components/dialog/confirm-dialog";
import { Button } from "@/common/components/ui/button";
import type { Course } from "@/common/types/course";

import { useDeleteCourse } from "../hooks/use-delete-course";

type MentorCourseActionButtonProps = {
    course: Course;
};

export const MentorCourseActionButton = ({
    course,
}: MentorCourseActionButtonProps) => {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const { deleteCourse, isPending } = useDeleteCourse(course.id);

    return (
        <div className="flex gap-3">
            <Button
                variant="outline"
                size="icon"
                asChild
                id={`edit-course-${course.id}`}
            >
                <Link to={`/mentor/my-courses/${course.id}/edit`}>
                    <Edit className="size-4" />
                </Link>
            </Button>

            <Button
                variant="outline"
                size="icon"
                onClick={() => setIsDeleteDialogOpen(true)}
                id={`delete-course-${course.id}`}
            >
                <Trash className="text-destructive size-4" />
            </Button>

            <ConfirmDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                title={`Confirm delete ${course.title}`}
                desc="Are you sure you want to delete this course? This action cannot be undone."
                handleConfirm={() => {
                    deleteCourse();
                    setIsDeleteDialogOpen(false);
                }}
                destructive={true}
                isLoading={isPending}
            />
        </div>
    );
};
