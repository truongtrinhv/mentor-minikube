import { httpClient } from "@/common/api/instance.axios";
import type { Result } from "@/common/types/result";

import type { FormValues } from "../types";

export const mentorApplicationService = {
    createApplication: (application: FormValues): Promise<Result<string>> =>
        httpClient.post("/application-requests", application),

    createApplicationWithFormData: (
        formData: FormData,
    ): Promise<Result<string>> =>
        httpClient.post("/application-requests", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }),
};
