import { httpClient } from "../api/instance.axios";
import type { Notification } from "../types/notification";

export const notificationServices = {
    get: () => httpClient.get<Notification[]>("/mentors/notifications"),
};
