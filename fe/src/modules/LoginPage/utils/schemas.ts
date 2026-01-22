import * as z from "zod";

import {
    EMAIL_CANNOT_BE_BLANK,
    EMAIL_IS_INVALID,
    PASSWORD_CANNOT_BE_BLANK,
} from "@/common/constants";

export const loginSchema = z.object({
    email: z
        .string()
        .nonempty(EMAIL_CANNOT_BE_BLANK)
        .regex(
            /^(?=.{8,50}$)[A-Za-z0-9]+(?:\.[A-Za-z0-9]+)*@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/,
            EMAIL_IS_INVALID,
        ),

    password: z.string().nonempty(PASSWORD_CANNOT_BE_BLANK),

    rememberMe: z.boolean().optional().default(false),
});
