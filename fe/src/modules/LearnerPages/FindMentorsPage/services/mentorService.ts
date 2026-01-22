import { httpClient } from "@/common/api/instance.axios";

import type { MentorQueryParams, MentorsApiResponse } from "../types";

const mentorService = {
    async getAllMentorsWithCourses(params: MentorQueryParams) {
        return httpClient.get<MentorsApiResponse>("mentors", {
            params: {
                pageNumber: params.pageNumber,
                pageSize: params.pageSize,
                search: params.search || undefined,
                categoryId: params.categoryId || undefined,
            },
        });
    },
};

export default mentorService;
