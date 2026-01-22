import { SessionStatus } from "@/common/types/enums";

export type MentoringSessionResponse = {
    id: string;
    startTime: Date;
    endTime: Date;
    learnerName: string;
    courseName: string;
    sessionType: number;
    sessionStatus: SessionStatus;
};

export const defaultMentoringSessionResponse: MentoringSessionResponse = {
    id: "",
    startTime: new Date(),
    endTime: new Date(),
    learnerName: "",
    courseName: "",
    sessionType: 0,
    sessionStatus: SessionStatus.Scheduled,
};

export type ScheduleOptionsResponse = {
    id: string;
    date: Date;
    startTime: Date;
    endTime: Date;
};

export function getSessionTypeName(sessionType: number): string {
    switch (sessionType) {
        case 0:
            return "Virtual";
        case 1:
            return "In-person";
        case 2:
            return "On-site";
        default:
            return "Unknown";
    }
}

export function getSessionStatusName(status?: SessionStatus): string {
    switch (status) {
        case SessionStatus.Pending:
            return "Pending";
        case SessionStatus.Scheduled:
            return "Scheduled";
        case SessionStatus.Completed:
            return "Completed";
        case SessionStatus.Cancelled:
            return "Cancelled";
        case SessionStatus.Rescheduling:
            return "Rescheduling";
        default:
            return "Unknown";
    }
}
