import { httpClient } from "@/common/api/instance.axios";
import type { QueryParameters } from "@/common/types/query";
import type { PaginationResult } from "@/common/types/result";

import type { CourseCategoryRequest } from "../types/course-request";
import type {
    CourseCategoryDetailResponse,
    CourseCategoryLookUpResponse,
    CourseCategoryResponse,
} from "../types/course-response";

const courseCategoryService = {
    lookup: () =>
        httpClient.get<CourseCategoryLookUpResponse[]>(
            "course-categories/look-up",
        ),
    getAll: (query?: QueryParameters) =>
        httpClient.get<PaginationResult<CourseCategoryResponse>>(
            "course-categories",
            { params: query },
        ),
    getById: (id: string) =>
        httpClient.get<CourseCategoryDetailResponse>(`course-categories/${id}`),
    create: (body: CourseCategoryRequest) =>
        httpClient.post<string>("course-categories", body),
    update: (id: string, body: CourseCategoryRequest) =>
        httpClient.put<string>(`/course-categories/${id}`, body),
    delete: (id: string) =>
        httpClient.delete<string>(`course-categories/${id}`),
};

export default courseCategoryService;
