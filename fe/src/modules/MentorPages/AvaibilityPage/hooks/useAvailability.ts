import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { toast } from "sonner";

import availabilityService from "../services/avaibilityService";
import type {
    CreateScheduleRequest,
    EditScheduleRequest,
    GetTimeSlotsParams,
} from "../types";

export const useAvailability = () => {
    const queryClient = useQueryClient();

    // Create schedule mutation
    const createScheduleMutation = useMutation({
        mutationFn: (data: CreateScheduleRequest) =>
            availabilityService.createSchedule(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["timeSlots"] });
            toast.success("Schedule created successfully!");
        },
        onError: (error: any) => {
            console.error("Error creating schedule:", error);
        },
    });

    // Update schedule mutation
    const updateScheduleMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: EditScheduleRequest }) =>
            availabilityService.updateSchedule(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["timeSlots"] });
            toast.success("Schedule has been updated successfully!");
        },
        onError: (error: any) => {
            console.error("Error updating schedule:", error);
        },
    });

    // Delete schedule mutation
    const deleteScheduleMutation = useMutation({
        mutationFn: (id: string) => availabilityService.deleteSchedule(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["timeSlots"] });
            toast.success("Schedule deleted successfully!");
        },
        onError: (error: any) => {
            console.error("Error deleting schedule:", error);
        },
    });

    // Get time slots function
    const getTimeSlots = useCallback(async (params: GetTimeSlotsParams) => {
        try {
            const response = await availabilityService.getTimeSlots(params);
            return response.data?.data;
        } catch (error) {
            console.error("Error fetching time slots:", error);
        }
    }, []);

    return {
        // Loading states
        isCreatingSchedule: createScheduleMutation.isPending,
        isUpdatingSchedule: updateScheduleMutation.isPending,
        isDeletingSchedule: deleteScheduleMutation.isPending,

        // Actions
        createSchedule: createScheduleMutation.mutate,
        updateSchedule: updateScheduleMutation.mutate,
        deleteSchedule: deleteScheduleMutation.mutate,
        getTimeSlots,
    };
};

export default useAvailability;
