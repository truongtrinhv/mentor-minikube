import { httpClient } from "../api/instance.axios";
import type {
    CurrentUser,
    LoginRequest,
    LoginResponse,
    RefreshTokenRequest,
    RefreshTokenResponse,
    ResendVerifyEmailRequest,
    VerifyEmailRequest,
    VerifyEmailResponse,
} from "../types/auth";

// Get API URL from environment or use default
const API_URL = import.meta.env.VITE_API_URL_ROOT || 'http://localhost:8000/api';

const authService = {
    login: (body: LoginRequest) =>
        httpClient.post<LoginResponse>(`${API_URL}/auth/login`, body),
    verifyEmail: (body: VerifyEmailRequest) =>
        httpClient.post<VerifyEmailResponse>(`${API_URL}/auth/verify-email`, body),
    getCurrentUser: () => httpClient.get<CurrentUser>(`${API_URL}/auth/me`),
    logout: () => httpClient.post(`${API_URL}/auth/logout`),
    getRefreshToken: (body: RefreshTokenRequest) =>
        httpClient.post<RefreshTokenResponse>(`${API_URL}/auth/refresh-token`, body),
    resendVerifyEmail: (body: ResendVerifyEmailRequest) =>
        httpClient.post(`${API_URL}/auth/resend-verify-email`, body),
};

export default authService;
