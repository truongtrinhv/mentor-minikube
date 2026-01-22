import { useQuery } from "@tanstack/react-query";
import { endOfDay } from "date-fns";
import { useMemo } from "react";

import availabilityService from "../services/avaibilityService";
import type { DayTimeSlotsResponse, TimeSlotResponse } from "../types";
import { formatDateForBackend } from "../utils/dateTimeUtils";

type UseWeekAvailabilityProps = {
    weekStart: Date;
    weekEnd: Date;
};

export const useWeekAvailability = ({
    weekStart,
    weekEnd,
}: UseWeekAvailabilityProps) => {
    const {
        data: weekAvailabilityData,
        isLoading,
        error,
    } = useQuery({
        queryKey: [
            "timeSlots",
            formatDateForBackend(weekStart),
            formatDateForBackend(weekEnd),
        ],
        queryFn: async () => {
            try {
                const response = await availabilityService.getTimeSlots({
                    startDate: weekStart.toISOString(),
                    endDate: endOfDay(weekEnd).toISOString(),
                });

                return response.data;
            } catch (error) {
                console.error("Error fetching time slots:", error);
            }
        },
    });

    const weekAvailabilityMap = useMemo(() => {
        if (!weekAvailabilityData || !Array.isArray(weekAvailabilityData))
            return {};

        const map: Record<string, TimeSlotResponse[]> = {};

        const startDate = new Date(weekStart);
        const endDate = new Date(weekEnd);
        let currentDate = new Date(startDate);

        while (currentDate <= endDate) {
            const dateKey = formatDateForBackend(currentDate);
            map[dateKey] = [];
            currentDate.setDate(currentDate.getDate() + 1);
        }

        weekAvailabilityData.forEach((dayData: DayTimeSlotsResponse) => {
            if (
                dayData &&
                dayData.timeSlots &&
                Array.isArray(dayData.timeSlots)
            ) {
                dayData.timeSlots.forEach((slot: TimeSlotResponse) => {
                    if (slot && slot.startTime) {
                        const startTimeDate = new Date(slot.startTime);
                        const slotDateKey = formatDateForBackend(startTimeDate);

                        if (map[slotDateKey]) {
                            map[slotDateKey].push(slot);
                        }
                    }
                });
            }
        });

        return map;
    }, [weekAvailabilityData, weekStart, weekEnd]);

    const getDayAvailability = (date: Date) => {
        const dateKey = formatDateForBackend(date);
        return weekAvailabilityMap[dateKey] || [];
    };

    return {
        weekAvailabilityData: weekAvailabilityData || [],
        weekAvailabilityMap,
        getDayAvailability,
        isLoading,
        error,
    };
};

export default useWeekAvailability;
