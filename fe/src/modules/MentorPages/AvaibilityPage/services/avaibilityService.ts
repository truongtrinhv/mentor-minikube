import { httpClient } from "@/common/api/instance.axios";
import type { Result } from "@/common/types/result";

import type {
    CreateScheduleRequest,
    DayTimeSlotsResponse,
    EditScheduleRequest,
    GetTimeSlotsParams,
} from "../types";

const availabilityService = {
    getTimeSlots: (params: GetTimeSlotsParams) =>
        httpClient.get<Result<DayTimeSlotsResponse[]>>("schedules", {
            params: {
                startDate: params.startDate,
                endDate: params.endDate,
            },
        }),

    createSchedule: (body: CreateScheduleRequest) =>
        httpClient.post<Result<string>>("schedules", body),

    updateSchedule: (id: string, body: EditScheduleRequest) =>
        httpClient.put<Result<string>>(`schedules/${id}`, body),

    deleteSchedule: (id: string) =>
        httpClient.delete<Result<string>>(`schedules/${id}`),
};

export default availabilityService;
