export type Token = {
    accessToken: string;
    refreshToken: string;
};

export type LoginRequest = {
    email: string;
    password: string;
};

export type VerifyEmailRequest = {
    email: string;
    code: string;
};

export type RefreshTokenRequest = Token;

export type VerifyEmailResponse = Token;

export type RefreshTokenResponse = Token;

export type LoginResponse = Token & {
    isVerifyEmail: boolean;
};

export enum Role {
    Admin = 0,
    Mentor = 1,
    Learner = 2,
    All = 3,
}

export type ResendVerifyEmailRequest = {
    email: string;
};

export type CurrentUser = {
    id: string;
    fullName: string;
    email: string;
    avatarUrl: string;
    role: Role;
};
