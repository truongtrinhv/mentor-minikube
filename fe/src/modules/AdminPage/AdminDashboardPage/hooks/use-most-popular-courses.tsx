import { useQuery } from "@tanstack/react-query";

import { adminDashboardServices } from "../services/admin-dashboard-services";

export const useMostPopularCourses = () => {
    const { data, isPending, isError } = useQuery({
        queryKey: ["most-popular-courses"],
        queryFn: () => adminDashboardServices.getMostPopularCoursesThisMonth(),
    });

    return {
        courses: data?.data?.courses,
        isPending,
        isError,
    };
};
