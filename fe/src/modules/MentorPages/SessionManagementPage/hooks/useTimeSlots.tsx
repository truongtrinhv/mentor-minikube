import { useQuery } from "@tanstack/react-query";
import { endOfDay, startOfDay } from "date-fns";

import mentoringSessionService from "../services/mentoringSessionService";

export const useTimeSlots = (mentorId: string, date: Date) => {
    const { data, isPending } = useQuery({
        queryKey: ["time-slots", mentorId, date],
        queryFn: () => {
            const from = startOfDay(date);
            const to = endOfDay(date);

            const query = {
                mentorId,
                startDate: from,
                endDate: to,
            };

            return mentoringSessionService.getScheduleByDate(query);
        },
    });

    return {
        timeSlots: data?.data ?? [],
        isPending,
    };
};
