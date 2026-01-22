import type { z } from "zod";

import type { otpSchema } from "../utils/schemas";

export type OTPFormValues = z.infer<typeof otpSchema>;
