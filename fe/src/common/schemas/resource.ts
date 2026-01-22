import z from "zod";

import { RESOURCE_MESSAGES } from "@/common/constants/validation-messages/resource";

const MAX_FILE_SIZE = 80 * 1000 * 1000;

const ACCEPTED_MIME_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "video/mp4",
    "video/quicktime",
];

export const resourceAddFormSchema = z.object({
    title: z
        .string()
        .nonempty(RESOURCE_MESSAGES.TITLE_REQUIRED)
        .transform((v) => v.trim())
        .refine((v) => v.length >= 3 && v.length <= 100, {
            message: RESOURCE_MESSAGES.TITLE_INVALID_LENGTH,
        }),

    description: z
        .string()
        .transform((v) => v.trim())
        .refine((v) => v.length <= 2000, {
            message: RESOURCE_MESSAGES.DESCRIPTION_MAX,
        }),

    file: z
        .instanceof(File, { message: RESOURCE_MESSAGES.FILE_INVALID })
        .refine((file) => file.size > 0, {
            message: RESOURCE_MESSAGES.FILE_CANNOT_BE_EMPTY,
        })
        .refine((file) => file.size <= MAX_FILE_SIZE, {
            message: RESOURCE_MESSAGES.FILE_TOO_LARGE,
        })
        .refine((file) => ACCEPTED_MIME_TYPES.includes(file.type), {
            message: RESOURCE_MESSAGES.FILE_TYPE_NOT_SUPPORTED,
        }),
});

export const resourceEditFormSchema = resourceAddFormSchema.omit({
    file: true,
});
