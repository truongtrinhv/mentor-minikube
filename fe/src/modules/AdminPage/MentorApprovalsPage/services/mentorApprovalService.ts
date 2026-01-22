import { httpClient } from "@/common/api/instance.axios";
import type { PaginationResult } from "@/common/types/result";

import type {
    ApplicationRequestQueryParams,
    MentorApplicationResponse,
    RequestUpdateApplicationDocumentRequest,
} from "../types";

const mentorApprovalService = {
    getApplicationRequests: (params: ApplicationRequestQueryParams) =>
        httpClient.get<PaginationResult<MentorApplicationResponse>>(
            "application-requests",
            { params },
        ),
    getApplicationRequestDetail: (id: string) =>
        httpClient.get<MentorApplicationResponse>(`application-requests/${id}`),

    approveApplication: (id: string) =>
        httpClient.put<boolean>(`application-requests/${id}/approve`),

    rejectApplication: (id: string, note: string) =>
        httpClient.put<boolean>(`application-requests/${id}/reject`, { note }),

    requestUpdate: (request: RequestUpdateApplicationDocumentRequest) =>
        httpClient.put<boolean>(
            `application-requests/${request.id}/request-update`,
            { note: request.note },
        ),
};

export default mentorApprovalService;
