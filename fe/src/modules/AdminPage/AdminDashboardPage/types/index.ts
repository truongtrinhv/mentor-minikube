export type UserStats = {
    activeUserCount: number;
    newUsersThisMonth: number;
    activeAdminCount: number;
    activeMentorCount: number;
    activeLearnerCount: number;
    activeApprovedMentorCount: number;
    activeUnapprovedMentorCount: number;
    pendingApplicationsCount: number;
    pendingApplicationsThisMonth: number;
};

export type CourseAndResourceStats = {
    courseCount: number;
    newCourseThisMonthCount: number;
    resourceCount: number;
    newResourceThisMonthCount: number;
};

export type MostPopularCourse = {
    id: string;
    title: string;
    categoryName: string;
    sessionCount: number;
    mentorName: string;
    mentorAvatar: string | null;
};

export type MostPopularCoursesResponse = {
    courses: MostPopularCourse[];
};

export type SessionStats = {
    sessionThisMonthCount: number;
    pendingSessionThisMonthCount: number;
    scheduledSessionThisMonthCount: number;
    completedSessionThisMonthCount: number;
    reschedulingSessionThisMonthCount: number;
    cancelledSessionThisMonthCount: number;
};
