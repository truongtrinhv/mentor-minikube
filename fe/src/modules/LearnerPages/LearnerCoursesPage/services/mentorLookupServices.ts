import { httpClient } from "@/common/api/instance.axios";
import { type QueryParameters, defaultQuery } from "@/common/types/query";
import type { PaginationResult } from "@/common/types/result";

import type { MentorLookup } from "../types";

export const mentorLookupServices = {
    lookup: (params: QueryParameters = defaultQuery) =>
        httpClient.get<PaginationResult<MentorLookup>>("users/mentors", {
            params,
        }),
};
