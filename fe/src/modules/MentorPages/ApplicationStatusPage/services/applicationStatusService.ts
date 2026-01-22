import { httpClient } from "@/common/api/instance.axios";
import type { Result } from "@/common/types/result";

import type { CurrentUserApplication } from "../types";

export const applicationStatusService = {
    getCurrentUserApplication: (): Promise<Result<CurrentUserApplication>> =>
        httpClient.get(`/application-requests/current-user`),

    updateApplication: (formData: FormData): Promise<Result<string>> =>
        httpClient.put(`/application-requests`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }),
};
