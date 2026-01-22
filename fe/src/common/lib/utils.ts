import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function decodeJwt(token: string): TokenClaims | null {
    if (!token) return null;
    const payload = token.split(".")[1]; // Lấy phần payload
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
        atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join(""),
    );
    return JSON.parse(jsonPayload);
}

export function isTokenExpired(token: string): boolean {
    let claims = decodeJwt(token);
    if (!claims) return true;
    return new Date() > new Date(claims.exp * 1000);
}

export type TokenClaims = {
    exp: number;
    iat: number;
    nbf: number;
    sub: string;
    role: string;
    iss: string;
    sid: string;
    aud: string;
    jti: string;
};
