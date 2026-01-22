import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { COURSE_MESSAGES } from "@/common/constants/validation-messages/course";
import { courseServices } from "@/common/services/courseServices";

export const useDeleteCourse = (courseId: string) => {
    const queryClient = useQueryClient();

    const { mutateAsync, isPending } = useMutation({
        mutationFn: () => courseServices.delete(courseId),
        onSuccess: () => {
            toast.success(COURSE_MESSAGES.DELETED_SUCCESSFULLY);

            queryClient.invalidateQueries({
                predicate: (query) => query.queryKey.includes("courses"),
            });
        },
    });

    return {
        deleteCourse: mutateAsync,
        isPending,
    };
};
