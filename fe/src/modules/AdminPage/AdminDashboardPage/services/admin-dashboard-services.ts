import { httpClient } from "@/common/api/instance.axios";

import {
    type CourseAndResourceStats,
    type MostPopularCoursesResponse,
    type SessionStats,
    type UserStats,
} from "../types";

export const adminDashboardServices = {
    getUserStats: () =>
        httpClient.get<UserStats>("/admin-dashboard/user-stats"),
    getCourseAndResourceStats: () =>
        httpClient.get<CourseAndResourceStats>(
            "/admin-dashboard/course-resource-stats",
        ),
    getMostPopularCoursesThisMonth: () =>
        httpClient.get<MostPopularCoursesResponse>(
            "/admin-dashboard/most-popular-courses",
        ),
    getSessionStats: () =>
        httpClient.get<SessionStats>("/admin-dashboard/session-stats"),
};
