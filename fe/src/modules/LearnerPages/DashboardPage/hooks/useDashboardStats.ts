import { useQuery } from "@tanstack/react-query";

import learnerDashboardService from "../services/learnerService";

export const dashboardQueryKeys = {
    all: ["dashboard"] as const,
    stats: () => [...dashboardQueryKeys.all, "stats"] as const,
    sessions: () => [...dashboardQueryKeys.all, "sessions"] as const,
    courses: () => [...dashboardQueryKeys.all, "courses"] as const,
};

export function useDashboardStats() {
    return useQuery({
        queryKey: dashboardQueryKeys.stats(),
        queryFn: async () => {
            const response = await learnerDashboardService.getDashboardStats();
            return response.data || null;
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: true,
        refetchOnMount: true,
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });
}
export function useUpcomingSessions() {
    return useQuery({
        queryKey: dashboardQueryKeys.sessions(),
        queryFn: async () => {
            const response = await learnerDashboardService.getUpcomingSession();
            return response.data || [];
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: true,
        refetchOnMount: true,
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });
}
export function useEnrolledCourses() {
    return useQuery({
        queryKey: dashboardQueryKeys.courses(),
        queryFn: async () => {
            const response = await learnerDashboardService.getEnrolledCourses();
            return response.data || [];
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: true,
        refetchOnMount: true,
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });
}
