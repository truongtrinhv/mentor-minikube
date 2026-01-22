import { useQuery } from "@tanstack/react-query";

import { adminDashboardServices } from "../services/admin-dashboard-services";

export const useCourseAndResourceStats = () => {
    const { data, isPending, isError } = useQuery({
        queryKey: ["course-resource-stats"],
        queryFn: () => adminDashboardServices.getCourseAndResourceStats(),
    });

    return {
        courseResourceStats: data?.data,
        isPending,
        isError,
    };
};
