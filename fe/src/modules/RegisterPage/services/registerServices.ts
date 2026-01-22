import { httpClient } from "@/common/api/instance.axios";
import type { LoginResponse } from "@/common/types/auth";
import type { Lookup } from "@/common/types/lookup";

import type { Expertise, RegisterRequest } from "../types";

export const registerService = {
    register: (body: RegisterRequest) =>
        httpClient.post<LoginResponse>("auth/register", body),
    registerWithFormData: (formData: FormData) =>
        httpClient.post<LoginResponse>("auth/register", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }),
    getAllCourseCategories: () =>
        httpClient.get<Lookup[]>("course-categories/look-up"),
    getAllExpertises: () => httpClient.get<Expertise[]>("expertises"),
};
