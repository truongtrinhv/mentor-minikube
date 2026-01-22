import type { z } from "zod";

import type { rescheduleSessionSchema } from "../schemas/reschedule-session-schema";

export type RescheduleSessionRequest = z.infer<typeof rescheduleSessionSchema>;
