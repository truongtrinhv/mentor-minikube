import { z } from "zod";

import { MENTOR_APPLICATION_VALIDATION_MESSAGES } from "@/common/constants/validation-messages/mentor-application";
import { ApplicationStatus } from "@/modules/AdminPage/MentorApprovalsPage/types";

import { ALL_ALLOWED_EXTENSIONS } from "../../ApplicationStatusPage/types";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const fileSchema = z.object({
    filePath: z
        .string()
        .nonempty({
            message: MENTOR_APPLICATION_VALIDATION_MESSAGES.filePath.required,
        })
        .max(1000, {
            message: MENTOR_APPLICATION_VALIDATION_MESSAGES.filePath.maxLength,
        }),

    fileName: z
        .string()
        .nonempty({
            message: MENTOR_APPLICATION_VALIDATION_MESSAGES.fileName.required,
        })
        .max(1000, {
            message: MENTOR_APPLICATION_VALIDATION_MESSAGES.fileName.maxLength,
        }),

    fileContent: z
        .instanceof(File, {
            message:
                MENTOR_APPLICATION_VALIDATION_MESSAGES.fileContent.required,
        })
        .refine((file) => file.size <= MAX_FILE_SIZE, {
            message: MENTOR_APPLICATION_VALIDATION_MESSAGES.fileContent.maxSize,
        })
        .refine(
            (file) => {
                const ext =
                    "." + file.name.split(".").pop()?.toLowerCase() || "";
                return ALL_ALLOWED_EXTENSIONS.includes(ext);
            },
            {
                message:
                    MENTOR_APPLICATION_VALIDATION_MESSAGES.fileContent
                        .extension,
            },
        ),
});

export const formSchema = z.object({
    education: z
        .string()
        .nonempty({
            message: MENTOR_APPLICATION_VALIDATION_MESSAGES.education.required,
        })
        .min(10, {
            message: MENTOR_APPLICATION_VALIDATION_MESSAGES.education.minLength,
        })
        .max(2000, {
            message: MENTOR_APPLICATION_VALIDATION_MESSAGES.education.maxLength,
        }),

    workExperience: z
        .string()
        .nonempty({
            message:
                MENTOR_APPLICATION_VALIDATION_MESSAGES.workExperience.required,
        })
        .min(10, {
            message:
                MENTOR_APPLICATION_VALIDATION_MESSAGES.workExperience.minLength,
        })
        .max(2000, {
            message:
                MENTOR_APPLICATION_VALIDATION_MESSAGES.workExperience.maxLength,
        }),

    certifications: z.array(z.string()).optional().nullable(),

    description: z
        .string()
        .nonempty({
            message:
                MENTOR_APPLICATION_VALIDATION_MESSAGES.description.required,
        })
        .min(10, {
            message:
                MENTOR_APPLICATION_VALIDATION_MESSAGES.description.minLength,
        })
        .max(2000, {
            message:
                MENTOR_APPLICATION_VALIDATION_MESSAGES.description.maxLength,
        }),

    status: z.nativeEnum(ApplicationStatus).default(ApplicationStatus.Pending),

    applicationDocuments: z.array(fileSchema).optional().nullable(),

    note: z
        .string()
        .max(2000, {
            message: MENTOR_APPLICATION_VALIDATION_MESSAGES.note.maxLength,
        })
        .optional()
        .nullable(),
});
