import { useQuery } from "@tanstack/react-query";

import { courseServices } from "@/common/services/courseServices";
import {
    type CourseQueryParams,
    defaultCourseQueryParams,
} from "@/common/types/course";

export const useCourses = (
    queryParams: CourseQueryParams = defaultCourseQueryParams,
) => {
    const { data, isPending, error } = useQuery({
        queryKey: ["courses", queryParams],
        queryFn: () => courseServices.getAll(queryParams),
    });

    return {
        courses: data?.data?.items,
        totalCount: data?.data?.totalCount,
        isPending,
        error,
    };
};
