import { z } from "zod";

import { COURSE_CATEGORY_MESSAGES } from "@/common/constants/validation-messages/course-category";

export const courseCategorySchema = z.object({
    name: z
        .string()
        .nonempty(COURSE_CATEGORY_MESSAGES.NAME_REQUIRED)
        .max(50, COURSE_CATEGORY_MESSAGES.NAME_MAX),
    description: z
        .string()
        .max(200, COURSE_CATEGORY_MESSAGES.DESCRIPTION_MAX)
        .optional(),
    isActive: z.boolean(),
});
