import type { Role } from "@/common/types/auth";

export type CreateConversationRequest = {
    userIds: string[];
    conversationName?: string;
    isGroup: boolean;
};

export type SendMessageRequest = {
    conversationId: string;
    content: string;
};

export type SearchUserResult = {
    id: string;
    fullName: string;
    avatarUrl?: string;
    role: Role;
};

export type ChatState = {
    conversations: ConversationResponse[];
    currentConversation: ConversationResponse | null;
    messages: MessageResponse[];
    isLoading: boolean;
    error: string | null;
};

export type HubSyncData = {
    conversations: ConversationResponse[];
    activeConversationId: string | undefined;
    notifications: NotificationResponse[];
};

export type ConversationResponse = {
    id: string;
    conversationName: string;
    isGroup: boolean;
    hasUnreadMessage: boolean;
    messages: MessageResponse[];
    participants: UserResponse[];
};

export type UserResponse = {
    id: string;
    fullName: string;
    avatarUrl: string;
    role: Role;
};

export type MessageResponse = {
    id: string;
    content: string;
    senderId: string;
    createdAt: Date;
    attachments: AttachmentResponse[];
};

export type AttachmentResponse = {
    id: string;
    url: string;
    type: string;
    size: number;
};

export type FileMessageRequest = {
    conversationId: string;
    content: string;
    files: File[];
};

export type NotificationResponse = {
    id: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: Date;
};
