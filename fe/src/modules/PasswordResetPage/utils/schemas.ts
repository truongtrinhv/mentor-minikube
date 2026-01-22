import * as z from "zod";

import {
    EMAIL_CANNOT_BE_BLANK,
    EMAIL_HAS_INVALID_LENGTH,
    EMAIL_IS_INVALID,
    OTP_HAS_INVALID_CHARACTERS,
    OTP_HAS_INVALID_LENGTH,
    PASSWORDS_DO_NOT_MATCH,
    PASSWORD_CANNOT_BE_BLANK,
    PASSWORD_IS_INVALID,
} from "@/common/constants";

// Define schema for OTP verification
export const emailSchema = z.object({
    email: z
        .string()
        .nonempty(EMAIL_CANNOT_BE_BLANK)
        .min(8, EMAIL_HAS_INVALID_LENGTH)
        .max(50, EMAIL_HAS_INVALID_LENGTH)
        .regex(
            /^(?=.{8,50}$)[A-Za-z0-9]+(?:\.[A-Za-z0-9]+)*@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/,
            EMAIL_IS_INVALID,
        ),
});

export const otpSchema = z.object({
    otp: z
        .string()
        .length(6, OTP_HAS_INVALID_LENGTH)
        .regex(/^\d+$/, OTP_HAS_INVALID_CHARACTERS),
});

// Define schema for new password
export const newPasswordSchema = z
    .object({
        password: z
            .string()
            .nonempty(PASSWORD_CANNOT_BE_BLANK)
            .regex(
                /^(?=.{8,32}$)(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*]).*$/,
                PASSWORD_IS_INVALID,
            ),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: PASSWORDS_DO_NOT_MATCH,
        path: ["confirmPassword"],
    });
