import { z } from "zod";

import { MENTOR_APPROVAL_MESSAGES } from "@/common/constants/validation-messages/mentor-approval";

export const noteSchema = z.object({
    note: z
        .string()
        .min(1, { message: MENTOR_APPROVAL_MESSAGES.NOTE_REQUIRED })
        .max(2000, { message: MENTOR_APPROVAL_MESSAGES.NOTE_MAX }),
});

export const rejectApplicationSchema = noteSchema;

export const requestUpdateSchema = noteSchema;

export const approveApplicationSchema = z.object({
    note: z
        .string()
        .max(2000, { message: MENTOR_APPROVAL_MESSAGES.NOTE_MAX })
        .optional(),
});

export type NoteSchemaType = z.infer<typeof noteSchema>;
export type RejectApplicationSchemaType = z.infer<
    typeof rejectApplicationSchema
>;
export type RequestUpdateSchemaType = z.infer<typeof requestUpdateSchema>;
export type ApproveApplicationSchemaType = z.infer<
    typeof approveApplicationSchema
>;
