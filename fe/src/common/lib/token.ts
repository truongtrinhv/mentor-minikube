import {
    ACCESS_TOKEN_KEY,
    REFRESH_TOKEN_KEY,
    REMEMBER_ME_KEY,
} from "../constants/keys";
import { PATH } from "../constants/paths";
import type { Token } from "../types/auth";

export const isLoginPage = () =>
    window.location.pathname == PATH.Login ||
    window.location.pathname == PATH.Register;

export const setClientToken = (token: Token) => {
    const storage =
        localStorage.getItem(REMEMBER_ME_KEY) === "true"
            ? localStorage
            : sessionStorage;

    storage.setItem(ACCESS_TOKEN_KEY, JSON.stringify(token.accessToken));
    storage.setItem(REFRESH_TOKEN_KEY, JSON.stringify(token.refreshToken));
};

export const getClientToken = (): Token | undefined => {
    const storage =
        localStorage.getItem(REMEMBER_ME_KEY) === "true"
            ? localStorage
            : sessionStorage;

    const accessToken = storage.getItem(ACCESS_TOKEN_KEY);
    const refreshToken = storage.getItem(REFRESH_TOKEN_KEY);

    if (accessToken && refreshToken) {
        return {
            accessToken: JSON.parse(accessToken),
            refreshToken: JSON.parse(refreshToken),
        };
    }
    return undefined;
};

export const removeClientToken = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const getAccessToken = (): string | null => {
    const token = getClientToken();
    return token?.accessToken ?? null;
};

export const getRefreshToken = (): string | null => {
    const token = getClientToken();
    return token?.refreshToken ?? null;
};
