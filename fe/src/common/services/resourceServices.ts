import { httpClient } from "@/common/api/instance.axios";
import type { PaginationResult } from "@/common/types/result";

import {
    type Resource,
    type ResourceAddFormData,
    type ResourceEditFormData,
    type ResourceQueryParams,
    defaultResourceQueryParams,
} from "../types/resource";

export const resourceServices = {
    getAll: (params: ResourceQueryParams = defaultResourceQueryParams) =>
        httpClient.get<PaginationResult<Resource>>("/resources", { params }),

    getById: (resourceId: string) =>
        httpClient.get<Resource>(`/resources/${resourceId}`),

    create: (data: ResourceAddFormData) => {
        const formData = new FormData();
        formData.append("title", data.title);
        formData.append("description", data.description);
        formData.append("file", data.file);

        return httpClient.post("/resources", formData);
    },

    update: (resourceId: string, data: ResourceEditFormData) =>
        httpClient.put(`/resources/${resourceId}`, data),

    delete: (resourceId: string) =>
        httpClient.delete(`/resources/${resourceId}`),

    getPreSignedUrl: (resourceId: string) =>
        httpClient.get<string>(`/resources/${resourceId}/pre-signed-url`),
};
