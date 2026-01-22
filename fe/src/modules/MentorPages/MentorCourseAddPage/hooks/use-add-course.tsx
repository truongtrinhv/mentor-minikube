import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { COURSE_MESSAGES } from "@/common/constants/validation-messages/course";
import { courseServices } from "@/common/services/courseServices";
import type { Course, CourseFormData } from "@/common/types/course";
import type { PaginationResult, Result } from "@/common/types/result";

export const useAddCourse = () => {
    const queryClient = useQueryClient();

    const { mutateAsync, isPending } = useMutation({
        mutationFn: (data: CourseFormData) => courseServices.create(data),
        onSuccess: (data: Result<Course>) => {
            toast.success(COURSE_MESSAGES.CREATED_SUCCESSFULLY);

            const newCourse = data.data!;

            queryClient.setQueriesData<Result<PaginationResult<Course>>>(
                {
                    predicate: (query) => query.queryKey.includes("courses"),
                },
                (prev) => {
                    console.log(prev);
                    if (!prev) return prev;

                    return {
                        ...prev,
                        data: {
                            ...prev.data!,
                            totalCount: prev.data!.totalCount + 1,
                            items: [newCourse, ...prev.data!.items],
                        },
                    };
                },
            );
        },
    });

    return {
        create: mutateAsync,
        isPending,
    };
};
