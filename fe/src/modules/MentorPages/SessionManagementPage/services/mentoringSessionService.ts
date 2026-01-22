import { httpClient } from "@/common/api/instance.axios";
import type { PaginationResult } from "@/common/types/result";

import type {
    MentoringSessionResponse,
    ScheduleOptionsResponse,
} from "../types/mentoring-session-response";
import type {
    MentorScheduleQueryParameters,
    SessionQueryParameters,
} from "../types/session-query-parameters";
import type { RescheduleSessionRequest } from "../types/update-session-request";

const mentoringSessionService = {
    getAll: (query?: SessionQueryParameters) =>
        httpClient.get<PaginationResult<MentoringSessionResponse>>(
            "mentoring-sessions",
            { params: query },
        ),

    getScheduleByDate: (query: MentorScheduleQueryParameters) =>
        httpClient.get<ScheduleOptionsResponse[]>(
            `mentoring-sessions/available-schedules`,
            { params: query },
        ),
    approve: (id: string) =>
        httpClient.post(`mentoring-sessions/${id}/approve`),
    reject: (id: string) => httpClient.post(`mentoring-sessions/${id}/reject`),
    reschedule: (id: string, body: RescheduleSessionRequest) =>
        httpClient.post(`mentoring-sessions/${id}/reschedule`, body),
    complete: (id: string) =>
        httpClient.post(`mentoring-sessions/${id}/complete`),
};

export default mentoringSessionService;
