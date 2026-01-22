import { httpClient } from "@/common/api/instance.axios";

import type {
    ForgotPasswordRequest,
    ResetPasswordRequest,
    VerifyForgotPasswordRequest,
} from "../types";

const resetPasswordService = {
    forgotPassword: (body: ForgotPasswordRequest) =>
        httpClient.post("auth/forgot-password", body),
    verifyForgotPassword: (body: VerifyForgotPasswordRequest) =>
        httpClient.post("auth/verify-forgot-password", body),
    resetPassword: (body: ResetPasswordRequest) =>
        httpClient.post("auth/reset-password", body),
};

export default resetPasswordService;
