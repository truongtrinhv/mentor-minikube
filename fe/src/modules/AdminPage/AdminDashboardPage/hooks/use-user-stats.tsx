import { useQuery } from "@tanstack/react-query";

import { adminDashboardServices } from "../services/admin-dashboard-services";

export const useUserStats = () => {
    const { data, isPending, isError } = useQuery({
        queryKey: ["user-stats"],
        queryFn: () => adminDashboardServices.getUserStats(),
    });

    return {
        userStats: data?.data,
        isPending,
        isError,
    };
};
