import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { COURSE_CATEGORY_MESSAGES } from "@/common/constants/validation-messages/course-category";
import { courseServices } from "@/common/services/courseServices";
import type { CourseFormData } from "@/common/types/course";

type EditMutationParams = {
    courseId: string;
    data: CourseFormData;
};

export const useEditCourse = () => {
    const queryClient = useQueryClient();

    const { mutateAsync, isPending } = useMutation({
        mutationFn: ({ courseId, data }: EditMutationParams) =>
            courseServices.update(courseId, data),
        onSuccess: () => {
            toast.success(COURSE_CATEGORY_MESSAGES.UPDATED_SUCCESSFULLY);

            queryClient.invalidateQueries({
                predicate: (query) => query.queryKey.includes("courses"),
            });
        },
    });

    return {
        edit: mutateAsync,
        isPending,
    };
};
