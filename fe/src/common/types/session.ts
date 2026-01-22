import type { CourseResponse } from "./course";
import type { ScheduleResponse } from "./schedule";

export type SessionResponse = {
    id: string;
    schedule: ScheduleResponse;
    course: CourseResponse;
    sessionType: SessionType;
    requestStatus: RequestMentoringSessionStatus;
    studentName: string;
};

enum RequestMentoringSessionStatus {
    Pending = 0,
    Scheduled = 1,
    Cancelled = 2,
    Rescheduling = 3,
    Completed = 4,
}

enum SessionType {
    Virtual = 0,
    InPerson = 1,
    Onsite = 2,
}
