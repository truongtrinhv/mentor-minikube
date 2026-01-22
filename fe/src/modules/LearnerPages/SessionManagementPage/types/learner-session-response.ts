import { SessionStatus } from "@/common/types/enums";

export type LearnerSessionResponse = {
    id: string;
    startTime: string;
    endTime: string;
    courseName: string;
    mentorName: string;
    sessionType: number;
    sessionStatus: SessionStatus;
    newStartTime: string;
    newEndTime: string;
    notes: string;
};

export const defaultLearnerSessionResponse: LearnerSessionResponse = {
    id: "",
    startTime: new Date().toISOString(),
    endTime: new Date().toISOString(),
    courseName: "",
    mentorName: "",
    sessionType: 0,
    notes: "",
    sessionStatus: SessionStatus.Scheduled,
    newStartTime: new Date().toISOString(),
    newEndTime: new Date().toISOString(),
};

export function getSessionTypeName(sessionType: number): string {
    switch (sessionType) {
        case 0:
            return "Virtual";
        case 1:
            return "In-person";
        case 2:
            return "Onsite";
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
