import { useQuery } from "@tanstack/react-query";

import { adminDashboardServices } from "../services/admin-dashboard-services";

export const useSessionStats = () => {
    const { data, isPending, isError } = useQuery({
        queryKey: ["session-stats"],
        queryFn: () => adminDashboardServices.getSessionStats(),
    });

    return {
        sessionStats: data?.data,
        isPending,
        isError,
    };
};
