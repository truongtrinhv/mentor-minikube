import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";

import type { NotificationResponse } from "@/modules/MessagePage/types";

import { useHubContext } from "./auth-context";

import type { NotificationContextType } from "../types/notification";

const NotificationContext = createContext<NotificationContextType>({
    notifications: [],
    unreadCount: 0,
    markAsRead: () => {},
    markAllAsRead: () => {},
    addNotification: () => {},
    removeNotification: () => {},
});

export const useNotificationContext = () => useContext(NotificationContext);

type NotificationProviderProps = {
    children: React.ReactNode;
};

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
    children,
}) => {
    const [notifications, setNotifications] = useState<NotificationResponse[]>(
        [],
    );
    const { dataCenter, readNotification, readNotifications } = useHubContext();

    useEffect(() => {
        if (dataCenter.notifications) {
            setNotifications(dataCenter.notifications);
        }
    }, [dataCenter.notifications]);

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    const markAsRead = useCallback((notificationId: string) => {
        setNotifications((prev) =>
            prev.map((n) =>
                n.id === notificationId ? { ...n, isRead: true } : n,
            ),
        );
        readNotification(notificationId);
    }, []);

    const markAllAsRead = useCallback(() => {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        readNotifications(notifications.map((n) => n.id));
    }, [notifications]);

    const addNotification = useCallback(
        (notificationData: Omit<NotificationResponse, "id">) => {
            const newNotification: NotificationResponse = {
                ...notificationData,
                id: Date.now().toString(),
            };
            setNotifications((prev) => [newNotification, ...prev]);
        },
        [],
    );

    const removeNotification = useCallback((notificationId: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    }, []);

    const value: NotificationContextType = {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        addNotification,
        removeNotification,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};
