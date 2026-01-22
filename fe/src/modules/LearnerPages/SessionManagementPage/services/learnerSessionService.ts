import { httpClient } from "@/common/api/instance.axios";
import type { PaginationResult } from "@/common/types/result";

import type { LearnerSessionResponse } from "../types/learner-session-response";
import type { SessionQueryParameters } from "../types/session-query-parameters";

const learnerSessionService = {
    getAll: (query?: SessionQueryParameters) =>
        httpClient.get<PaginationResult<LearnerSessionResponse>>(
            "mentoring-sessions",
            { params: query },
        ),

    approve: (id: string) =>
        httpClient.post(`mentoring-sessions/${id}/approve`),
    reject: (id: string) => httpClient.post(`mentoring-sessions/${id}/reject`),
};

export default learnerSessionService;
