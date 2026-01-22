import qs from "qs";

import { httpClient } from "@/common/api/instance.axios";
import type { PaginationResult } from "@/common/types/result";

import type { User } from "../types";

export const userServices = {
    get: (
        pageNumber: number = 1,
        pageSize: number = 10,
        searchQuery: string = "",
        selectedRoles: string[] = [],
    ) =>
        httpClient.get<PaginationResult<User>>("users", {
            params: {
                pageNumber,
                pageSize,
                search: searchQuery,
                role: selectedRoles,
            },
            paramsSerializer: (params) =>
                qs.stringify(params, { arrayFormat: "repeat" }),
        }),
    activate: (userId: string) => httpClient.patch(`users/${userId}/activate`),
    deactivate: (userId: string) =>
        httpClient.patch(`users/${userId}/deactivate`),
};
