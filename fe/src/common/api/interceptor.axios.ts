/* eslint-disable @typescript-eslint/no-explicit-any */
import type { InternalAxiosRequestConfig } from "axios";

import { getAccessToken } from "../lib/token";

export const authRequestInterceptor = (
    config: InternalAxiosRequestConfig,
): InternalAxiosRequestConfig => {
    const token = getAccessToken();
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
};
