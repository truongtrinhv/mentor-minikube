export type ForgotPasswordRequest = {
    email: string;
};

export type VerifyForgotPasswordRequest = {
    email: string;
    code: string;
};

export type ResetPasswordRequest = {
    email: string;
    code: string;
    newPassword: string;
};
