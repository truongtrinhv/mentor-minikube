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
    PASSWORD_CANNOT_BE_BLANK,
    PASSWORD_IS_INVALID,
    PHOTO_IS_TOO_LARGE,
    PREFERRED_COMMUNICATION_IS_INVALID,
    PREFERRED_LEARNING_STYLE_IS_INVALID,
    PREFERRED_SESSION_DURATION_IS_INVALID,
    PREFERRED_SESSION_FREQUENCY_IS_INVALID,
    PREFERRED_TEACHING_METHOD_IS_INVALID,
    PROFESSIONAL_SKILL_HAS_INVALID_LENGTH,
    ROLE_IS_INVALID,
    TOPIC_IS_INVALID,
    TOS_AND_PP_NOT_ACCEPTED,
} from "@/common/constants";

// Step 1: Account Information
export const accountSchema = z
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

        password: z
            .string()
            .nonempty(PASSWORD_CANNOT_BE_BLANK)
            .regex(
                /^(?=.{8,32}$)(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*]).*$/,
                PASSWORD_IS_INVALID,
            ),

        confirmPassword: z.string(),

        termsAgreed: z
            .boolean()
            .refine((value) => value === true, TOS_AND_PP_NOT_ACCEPTED),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: PASSWORDS_DO_NOT_MATCH,
        path: ["confirmPassword"],
    });

// Step 2: Role & Profile Information
export const profileSchema = z.object({
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

    role: z.enum(["Learner", "Mentor"], {
        required_error: ROLE_IS_INVALID,
    }),

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

    availability: z
        .array(z.string())
        .refine(
            (val) => val.every((id) => typeof id === "string"),
            AVAILABILITY_IS_INVALID,
        ),

    communicationPreference: z.enum(["Video call", "Audio call", "Text chat"], {
        required_error: PREFERRED_COMMUNICATION_IS_INVALID,
    }),

    goals: z.string().max(200, GOALS_HAS_INVALID_LENGTH).optional(),
});

// Step 3: Preferences
export const preferencesSchema = z.object({
    courseCategoryIds: z
        .array(z.string())
        .optional()
        .refine(
            (val) => !val || val.every((id) => typeof id === "string"),
            TOPIC_IS_INVALID,
        ),

    sessionFrequency: z.enum(
        ["Weekly", "Every two weeks", "Monthly", "As Needed"],
        {
            required_error: PREFERRED_SESSION_FREQUENCY_IS_INVALID,
        },
    ),

    duration: z.enum(
        ["30 minutes", "45 minutes", "1 hour", "1.5 hours", "2 hours"],
        {
            required_error: PREFERRED_SESSION_DURATION_IS_INVALID,
        },
    ),

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

    privacySettings: z
        .object({
            isPrivateProfile: z.boolean().default(false),
            isReceiveMessage: z.boolean().default(true),
            isNotification: z.boolean().default(true),
        })
        .optional(),
});
