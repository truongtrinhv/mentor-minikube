import type { SessionStatus } from "@/common/types/enums";
import { type QueryParameters, defaultQuery } from "@/common/types/query";

export type SessionQueryParameters = QueryParameters & {
    sessionStatus?: SessionStatus | null;
    courseId?: string | null;
    from?: Date | null;
    to?: Date | null;
};

export type MentorScheduleQueryParameters = {
    mentorId: string;
    startDate: Date | string;
    endDate?: Date | string;
};

export const defaultSessionQuery: SessionQueryParameters = {
    ...defaultQuery,
    sessionStatus: null,
    courseId: null,
    from: null,
    to: null,
};
