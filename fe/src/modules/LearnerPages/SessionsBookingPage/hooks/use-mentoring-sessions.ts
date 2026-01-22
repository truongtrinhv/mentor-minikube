import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { handleErrorApi } from "@/common/lib/toast-message";

import mentoringSessionService from "../services/mentoringSessionService";
import type { CreateSessionRequest, ScheduleQueryParameters } from "../types";

export const useAvailableSchedules = (
    queryParams: ScheduleQueryParameters,
    enabled: boolean = true,
) => {
    const { data, isPending, error } = useQuery({
        queryKey: ["availableSchedules", queryParams],
        queryFn: async () => {
            const response =
                await mentoringSessionService.getAvailableSchedules(
                    queryParams,
                );
            return response.data || [];
        },
        enabled: enabled && !!queryParams.mentorId,
        staleTime: 1000 * 60 * 2,
        refetchOnWindowFocus: false,
    });

    return {
        schedules: data || [],
        isPending,
        error,
    };
};

export const useCreateSession = () => {
    const queryClient = useQueryClient();

    const { mutate, isPending, error } = useMutation({
        mutationFn: (request: CreateSessionRequest) =>
            mentoringSessionService.createSession(request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["availableSchedules"] });
            toast.success("Session booked successfully!");
        },
        onError: (error: unknown) => {
            if (error && typeof error === "object" && "response" in error) {
                const errorResponse = (error as any).response?.data;
                if (
                    errorResponse?.errors &&
                    Array.isArray(errorResponse.errors)
                ) {
                    handleErrorApi(errorResponse.errors);
                } else {
                    toast.error(
                        "Failed to book session. Please try again later.",
                    );
                }
            } else {
                toast.error("Failed to book session. Please try again later.");
            }
        },
    });

    return {
        mutate,
        isPending,
        error,
    };
};
