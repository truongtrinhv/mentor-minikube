import { useQuery } from "@tanstack/react-query";

import courseCategoryService from "@/modules/AdminPage/ManageCourseCategoryPage/services/courseCategoryService";
import type { CourseCategoryLookUpResponse } from "@/modules/AdminPage/ManageCourseCategoryPage/types/course-response";

export const useCourseCategoriesLookup = () => {
    const {
        data: response,
        isPending,
        error,
    } = useQuery({
        queryKey: ["course-categories-lookup"],
        queryFn: () => courseCategoryService.lookup(),
        staleTime: 10 * 60 * 1000, // 10 minutes
    });

    const categories: CourseCategoryLookUpResponse[] = response?.data || [];

    return {
        categories,
        isPending,
        error,
    };
};
