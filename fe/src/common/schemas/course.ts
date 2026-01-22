import z from "zod";

import { COURSE_MESSAGES } from "../constants/validation-messages/course";

export const courseFormDataSchema = z.object({
    title: z
        .string()
        .transform((s) => s.trim())
        .refine((s) => s.length > 0, {
            message: COURSE_MESSAGES.COURSE_TITLE_CANNOT_BE_BLANK,
        })
        .refine((s) => s.length >= 3 && s.length <= 100, {
            message: COURSE_MESSAGES.COURSE_TITLE_HAS_INVALID_LENGTH,
        }),

    description: z
        .string()
        .transform((s) => s.trim())
        .refine((s) => s.length <= 2000, {
            message: COURSE_MESSAGES.COURSE_DESCRIPTION_HAS_INVALID_LENGTH,
        }),

    courseCategoryId: z
        .string()
        .nonempty(COURSE_MESSAGES.COURSE_CATEGORY_CANNOT_BE_BLANK),

    level: z.union([z.literal(0), z.literal(1), z.literal(2)], {
        message: COURSE_MESSAGES.COURSE_LEVEL_IS_INVALID,
        required_error: COURSE_MESSAGES.COURSE_TITLE_CANNOT_BE_BLANK,
    }),

    resourceIds: z.array(z.string()),
});
