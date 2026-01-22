import { httpClient } from "@/common/api/instance.axios";
import type { Result } from "@/common/types/result";

import type {
    CreateSessionRequest,
    CreateSessionResponse,
    ScheduleQueryParameters,
    ScheduleResponse,
} from "../types";

const mentoringSessionService = {
    getAvailableSchedules: (queryParams: ScheduleQueryParameters) =>
        httpClient.get<Result<ScheduleResponse[]>>(
            "mentoring-sessions/available-schedules",
            {
                params: queryParams,
            },
        ),

    createSession: (request: CreateSessionRequest) =>
        httpClient.post<Result<CreateSessionResponse>>(
            "mentoring-sessions",
            request,
        ),
};

export default mentoringSessionService;
