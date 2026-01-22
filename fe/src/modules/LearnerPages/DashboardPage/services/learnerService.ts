import { httpClient } from "@/common/api/instance.axios";
import type { Result } from "@/common/types/result";

import type { DashboardStats, EnrolledCourse, UpcomingSession } from "../types";

const learnerDashboardService = {
    getDashboardStats: () =>
        httpClient.get<Result<DashboardStats>>("learner-dashboard/stats"),
    getUpcomingSession: () =>
        httpClient.get<Result<UpcomingSession[]>>(
            "learner-dashboard/upcoming-sessions",
        ),
    getEnrolledCourses: () =>
        httpClient.get<Result<EnrolledCourse[]>>(
            "learner-dashboard/enrolled-courses",
        ),
};

export default learnerDashboardService;
