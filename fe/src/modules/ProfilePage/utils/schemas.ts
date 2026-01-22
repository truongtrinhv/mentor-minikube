import * as z from "zod";

import {
    AREA_OF_EXPERTISE_IS_INVALID,
    AVAILABILITY_IS_INVALID,
    BIO_HAS_INVALID_LENGTH,
    EMAIL_CANNOT_BE_BLANK,
    EMAIL_HAS_INVALID_LENGTH,
    EMAIL_IS_INVALID,
    FULLNAME_CANNOT_BE_BLANK,
    FULLNAME_HAS_INVALID_LENGTH,
    GOALS_HAS_INVALID_LENGTH,
    INDUSTRY_EXPERIENCE_HAS_INVALID_LENGTH,
    PASSWORDS_DO_NOT_MATCH,
    PASSWORD_IS_INVALID,
    PHOTO_IS_TOO_LARGE,
    PREFERRED_COMMUNICATION_IS_INVALID,
    PREFERRED_LEARNING_STYLE_IS_INVALID,
    PREFERRED_SESSION_DURATION_IS_INVALID,
    PREFERRED_SESSION_FREQUENCY_IS_INVALID,
    PREFERRED_TEACHING_METHOD_IS_INVALID,
    PROFESSIONAL_SKILL_HAS_INVALID_LENGTH,
    TOPIC_IS_INVALID,
} from "@/common/constants";

export const profileUpdateSchema = z.object({
    photo: z
        .any()
        .optional()
        .refine(
            (file) => !file || file.size <= 5 * 1024 * 1024,
            PHOTO_IS_TOO_LARGE,
        ),

    fullName: z
        .string()
        .trim()
        .nonempty(FULLNAME_CANNOT_BE_BLANK)
        .min(3, FULLNAME_HAS_INVALID_LENGTH)
        .max(200, FULLNAME_HAS_INVALID_LENGTH),

    bio: z.string().max(2000, BIO_HAS_INVALID_LENGTH).optional(),

    expertises: z
        .array(z.string())
        .optional()
        .refine(
            (val) => !val || val.every((id) => typeof id === "string"),
            AREA_OF_EXPERTISE_IS_INVALID,
        ),

    professionalSkill: z
        .string()
        .max(200, PROFESSIONAL_SKILL_HAS_INVALID_LENGTH)
        .optional(),

    experience: z
        .string()
        .max(200, INDUSTRY_EXPERIENCE_HAS_INVALID_LENGTH)
        .optional(),

    goals: z.string().max(200, GOALS_HAS_INVALID_LENGTH).optional(),

    availability: z
        .array(z.string())
        .optional()
        .refine(
            (val) => !val || val.every((id) => typeof id === "string"),
            AVAILABILITY_IS_INVALID,
        ),

    communicationPreference: z
        .enum(["Video call", "Audio call", "Text chat"], {
            required_error: PREFERRED_COMMUNICATION_IS_INVALID,
        })
        .optional(),

    courseCategoryIds: z
        .array(z.string())
        .optional()
        .refine(
            (val) => !val || val.every((id) => typeof id === "string"),
            TOPIC_IS_INVALID,
        ),

    sessionFrequency: z
        .enum(["Weekly", "Every two weeks", "Monthly", "As Needed"], {
            required_error: PREFERRED_SESSION_FREQUENCY_IS_INVALID,
        })
        .optional(),

    duration: z
        .enum(["30 minutes", "45 minutes", "1 hour", "1.5 hours", "2 hours"], {
            required_error: PREFERRED_SESSION_DURATION_IS_INVALID,
        })
        .optional(),

    learningStyle: z
        .string()
        .refine(
            (val) => typeof val === "string",
            PREFERRED_LEARNING_STYLE_IS_INVALID,
        )
        .nullable()
        .optional(),

    teachingStyles: z
        .enum(["handson", "discussion", "project", "lecture"], {
            required_error: PREFERRED_TEACHING_METHOD_IS_INVALID,
        })
        .nullable()
        .optional(),

    isPrivateProfile: z.boolean(),
    isReceiveMessage: z.boolean(),
    isNotification: z.boolean(),
});

// Account Update Schema
export const accountUpdateSchema = z
    .object({
        email: z
            .string()
            .nonempty(EMAIL_CANNOT_BE_BLANK)
            .min(8, EMAIL_HAS_INVALID_LENGTH)
            .max(50, EMAIL_HAS_INVALID_LENGTH)
            .regex(
                /^(?=.{8,50}$)[A-Za-z0-9]+(?:\.[A-Za-z0-9]+)*@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/,
                EMAIL_IS_INVALID,
            ),

        currentPassword: z.string().optional().or(z.literal("")),

        password: z
            .string()
            .optional()
            .or(z.literal(""))
            .refine(
                (val) =>
                    !val ||
                    val.match(
                        /^(?=.{8,32}$)(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*]).*$/,
                    ),
                PASSWORD_IS_INVALID,
            ),

        confirmPassword: z.string().optional().or(z.literal("")),
    })
    .refine(
        (data) => {
            if (data.password && data.password.length > 0) {
                return data.currentPassword && data.currentPassword.length > 0;
            }
            return true;
        },
        {
            message: "Current password is required when setting a new password",
            path: ["currentPassword"],
        },
    )
    .refine(
        (data) => {
            if (data.password && data.password.length > 0) {
                return data.password === data.confirmPassword;
            }
            return true;
        },
        {
            message: PASSWORDS_DO_NOT_MATCH,
            path: ["confirmPassword"],
        },
    );

export type ProfileUpdateFormValues = z.infer<typeof profileUpdateSchema>;
export type AccountUpdateFormValues = z.infer<typeof accountUpdateSchema>;
