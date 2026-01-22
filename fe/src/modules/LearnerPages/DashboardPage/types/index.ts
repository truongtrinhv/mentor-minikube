export enum SessionType {
    Virtual = 0,
    InPerson = 1,
    Onsite = 2,
}

export enum RequestMentoringSessionStatus {
    Pending = 0,
    Scheduled = 1,
    Cancelled = 2,
    Rescheduling = 3,
    Completed = 4,
}

export enum CourseLevel {
    Beginner = 0,
    Intermediate = 1,
    Advanced = 2,
}

export type UpcomingSession = {
    id: string;
    courseTitle: string;
    mentorName: string;
    mentorAvatar?: string;
    scheduledDate: string;
    startTime: string;
    endTime: string;
    sessionType: SessionType;
    status: RequestMentoringSessionStatus;
};

export type EnrolledCourse = {
    id: string;
    title: string;
    description: string;
    mentorName: string;
    mentorAvatar?: string;
    mentorEmail: string;
    category: {
        id: string;
        name: string;
    };
    level: CourseLevel;
    learnerCount: number;
    scheduledSessionCount: number;
    completedSessionCount: number;
};

// export type SessionNotification = {
//     id: string;
//     type: number; // 0: session_reminder, 1: session_cancelled, 2: session_rescheduled
//     title: string;
//     message: string;
//     sessionId: string;
//     courseTitle: string;
//     scheduledDate: Date;
//     isRead: boolean;
//     createdAt: Date;
// };

export type DashboardStats = {
    totalEnrolledCourses: number;
    totalUpcomingSessions: number;
    totalCompletedSessions: number;
};
