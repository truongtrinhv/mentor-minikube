import { Bell, CheckCheck } from "lucide-react";
import React from "react";

import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/common/components/ui/dropdown-menu";
import type { NotificationResponse } from "@/modules/MessagePage/types";
import { formatNotificationTimestamp } from "@/modules/MessagePage/utils/time";

import { useNotificationContext } from "../../context/notification-context";

type NotificationItemProps = {
    notification: NotificationResponse;
    onMarkAsRead: (id: string) => void;
};

const NotificationItem: React.FC<NotificationItemProps> = ({
    notification,
    onMarkAsRead,
}) => {
    const handleClick = () => {
        if (!notification.isRead) {
            onMarkAsRead(notification.id);
        }
    };

    const content = (
        <div
            className={`flex items-start gap-3 p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
                !notification.isRead ? "bg-blue-50 dark:bg-blue-950/20" : ""
            }`}
            onClick={handleClick}
        >
            <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                    <h4
                        className={`text-sm font-medium ${!notification.isRead ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"}`}
                    >
                        {notification.title}
                    </h4>
                    {!notification.isRead && (
                        <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
                    )}
                </div>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {notification.message}
                </p>
                <span className="mt-2 block text-xs text-gray-500 dark:text-gray-500">
                    {formatNotificationTimestamp(notification.createdAt)}
                </span>
            </div>
        </div>
    );

    return content;
};

export const NotificationDropdown: React.FC = () => {
    const { notifications, unreadCount, markAsRead, markAllAsRead } =
        useNotificationContext();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    className="relative"
                    aria-label="Notifications"
                >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs"
                        >
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0">
                <div className="flex items-center justify-between border-b p-4">
                    <DropdownMenuLabel className="p-0 text-base font-semibold">
                        Notifications
                    </DropdownMenuLabel>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={markAllAsRead}
                            className="h-auto p-1 text-sm text-blue-600 hover:text-blue-700"
                        >
                            <CheckCheck className="mr-1 h-4 w-4" />
                            Mark all as read
                        </Button>
                    )}
                </div>

                {notifications.length === 0 ? (
                    <div className="p-8 text-center">
                        <Bell className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                        <p className="text-gray-500 dark:text-gray-400">
                            No notifications
                        </p>
                    </div>
                ) : (
                    <div className="max-h-96 overflow-y-auto">
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {notifications.map((notification) => (
                                <NotificationItem
                                    key={notification.id}
                                    notification={notification}
                                    onMarkAsRead={markAsRead}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
