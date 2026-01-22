import { z } from "zod";

import { MENTORING_SESSION_MESSAGES } from "@/common/constants/validation-messages/mentoring-session";

export const rescheduleSessionSchema = z.object({
    newScheduleId: z
        .string()
        .nonempty(MENTORING_SESSION_MESSAGES.RESCHEDULE_ID_REQUIRED),
    notes: z
        .string()
        .nonempty(MENTORING_SESSION_MESSAGES.NOTES_REQUIRED)
        .max(200, MENTORING_SESSION_MESSAGES.NOTES_MAX),
});
