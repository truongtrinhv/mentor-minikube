import type { SessionStatus } from "@/common/types/enums";

export type UpdateSessionStatusRequest = {
    status?: SessionStatus;
};

export type RescheduleSessionRequest = {
    rescheduleId: string;
    notes: string;
};
