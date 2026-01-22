import { httpClient } from "@/common/api/instance.axios";
import type { SessionResponse } from "@/common/types/session";

export const sessionServices = {
    getUpcomingSessions: () =>
        httpClient.get<SessionResponse[]>("/mentors/upcoming-sessions"),
};
