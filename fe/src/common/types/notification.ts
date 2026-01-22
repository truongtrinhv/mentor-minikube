import type { NotificationResponse } from "@/modules/MessagePage/types";

export type Notification = NotificationResponse & {
    type: number; // 0: session_reminder, 1: session_cancelled, 2: session_rescheduled
    isRead: boolean;
    createdAt: Date;
    relatedId?: string;
    actionUrl?: string;
};

export type NotificationContextType = {
    notifications: NotificationResponse[];
    unreadCount: number;
    markAsRead: (notificationId: string) => void;
    markAllAsRead: () => void;
    addNotification: (notification: Omit<NotificationResponse, "id">) => void;
    removeNotification: (notificationId: string) => void;
};
