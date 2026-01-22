import type { CreateAxiosDefaults } from "axios";

export const ROOT_API: CreateAxiosDefaults = {
    baseURL: import.meta.env.VITE_API_URL_ROOT,
};

const getSignalRBaseUrl = () => {
    const apiUrl = import.meta.env.VITE_API_URL_ROOT;
    return apiUrl.replace("/api", "");
};

export const SIGNALR_BASE_URL = getSignalRBaseUrl();
