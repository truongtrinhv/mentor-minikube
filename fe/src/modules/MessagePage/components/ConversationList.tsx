import { MessageCircle, MessageSquarePlus, Search, Users } from "lucide-react";
import React, { useMemo, useState } from "react";

import { ScrollArea } from "@/common/components/ui/scroll-area";

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "../../../common/components/ui/avatar";
import { Badge } from "../../../common/components/ui/badge";
import { Input } from "../../../common/components/ui/input";
import { cn } from "../../../common/lib/utils";
import { Role } from "../../../common/types/auth";
import type { ConversationResponse, UserResponse } from "../types";

type ConversationListProps = {
    conversations: ConversationResponse[];
    currentConversation: ConversationResponse | null;
    currentUser: UserResponse;
    onSelectConversation: (conversation: ConversationResponse) => void;
    onCreateConversation: () => void;
};

export const ConversationList: React.FC<ConversationListProps> = ({
    conversations = [],
    currentConversation,
    currentUser,
    onSelectConversation,
    onCreateConversation,
}) => {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredConversations = useMemo(() => {
        if (!searchTerm.trim()) {
            return conversations || [];
        }

        const query = searchTerm.trim().toLowerCase();

        return (conversations || []).filter((conversation) => {
            const nameMatch = conversation.conversationName
                .toLowerCase()
                .includes(query);

            const participantMatch = conversation.participants.some((p) =>
                p.fullName.toLowerCase().includes(query),
            );

            return nameMatch || participantMatch;
        });
    }, [conversations, searchTerm]);

    const unreadConversations = filteredConversations.filter(
        (conv) => conv.hasUnreadMessage,
    );

    const unreadCount = unreadConversations.length;

    const getRoleBadgeVariant = (role: Role) => {
        switch (role) {
            case Role.Admin:
                return "destructive";
            case Role.Mentor:
                return "secondary";
            default:
                return "outline";
        }
    };

    const getRoleDisplayText = (role: Role) => {
        switch (role) {
            case Role.Admin:
                return "Admin";
            case Role.Mentor:
                return "Mentor";
            default:
                return "Learner";
        }
    };

    const getOtherParticipant = (conversation: ConversationResponse) => {
        if (conversation.isGroup || conversation.participants.length !== 2) {
            return null;
        }

        const currentUserId = String(currentUser.id);
        const otherParticipant = conversation.participants.find(
            (p) => String(p.id) !== currentUserId,
        );

        return otherParticipant;
    };

    const getConversationName = (conversation: ConversationResponse) => {
        if (conversation.isGroup) {
            return conversation.conversationName || "Group chat";
        }
        const otherUser = getOtherParticipant(conversation);
        return otherUser?.fullName || "User";
    };

    const getConversationAvatar = (conversation: ConversationResponse) => {
        if (conversation.isGroup) {
            return undefined;
        }
        const otherUser = getOtherParticipant(conversation);
        return otherUser?.avatarUrl;
    };

    const getConversationRole = (conversation: ConversationResponse) => {
        if (conversation.isGroup) {
            return undefined;
        }
        const otherUser = getOtherParticipant(conversation);
        return otherUser?.role ?? Role.Learner;
    };

    const getConversationRoleDisplayText = (
        conversation: ConversationResponse,
    ) => {
        if (conversation.isGroup) {
            return undefined;
        }
        const role = getConversationRole(conversation);
        return role !== undefined
            ? getRoleDisplayText(role)
            : getRoleDisplayText(Role.Learner);
    };

    const handleConversationClick = (conversation: ConversationResponse) => {
        onSelectConversation(conversation);
    };

    return (
        <div className="bg-card border-border flex h-full flex-col border-r">
            {/* Header - Fixed */}
            <div className="border-border flex-shrink-0 border-b p-4">
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <h2 className="text-lg font-semibold">Messages</h2>
                        {unreadCount > 0 && (
                            <Badge
                                variant="default"
                                className="bg-blue-500 text-white hover:bg-blue-600"
                            >
                                {unreadCount}
                            </Badge>
                        )}
                    </div>
                    <button
                        onClick={() => onCreateConversation()}
                        className="hover:bg-muted/50 mr-1 flex items-center gap-2 rounded-md p-2 transition-colors"
                    >
                        <MessageSquarePlus className="h-6 w-6" />
                    </button>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                    <Input
                        placeholder="Search conversation..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Conversation List - Scrollable with Fixed Height */}
            <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                    <div className="space-y-1 p-2">
                        {filteredConversations.length === 0 ? (
                            <div className="text-muted-foreground flex min-h-[200px] flex-col items-center justify-center py-12 text-center">
                                <MessageCircle className="mb-4 h-12 w-12 opacity-50" />
                                <p className="font-medium">
                                    No conversations yet
                                </p>
                                <p className="text-sm">
                                    Create a new conversation to start
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {filteredConversations.map((conversation) => {
                                    const isSelected =
                                        currentConversation?.id ===
                                        conversation.id;
                                    const conversationName =
                                        getConversationName(conversation);
                                    const avatar =
                                        getConversationAvatar(conversation);

                                    return (
                                        <div
                                            key={conversation.id}
                                            onClick={() =>
                                                handleConversationClick(
                                                    conversation,
                                                )
                                            }
                                            className={cn(
                                                "hover:bg-muted/50 flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 transition-all duration-200 hover:shadow-sm",
                                                isSelected &&
                                                    "bg-muted border-border/50 border shadow-sm",
                                                conversation.hasUnreadMessage &&
                                                    !isSelected &&
                                                    "border-l-4 border-l-blue-500 bg-blue-50/50 hover:bg-blue-100/50 dark:bg-blue-950/20 dark:hover:bg-blue-950/30",
                                            )}
                                        >
                                            {/* Avatar */}
                                            <div className="relative flex-shrink-0">
                                                <Avatar className="h-10 w-10">
                                                    {conversation.isGroup ? (
                                                        <div className="bg-primary/10 flex h-full w-full items-center justify-center">
                                                            <Users className="text-primary h-5 w-5" />
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <AvatarImage
                                                                src={avatar}
                                                            />
                                                            <AvatarFallback className="text-sm">
                                                                {conversationName
                                                                    .charAt(0)
                                                                    .toUpperCase()}
                                                            </AvatarFallback>
                                                        </>
                                                    )}
                                                </Avatar>

                                                {/* Unread Message Indicator */}
                                                {conversation.hasUnreadMessage && (
                                                    <div className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-blue-500 shadow-sm">
                                                        <div className="h-1.5 w-1.5 rounded-full bg-white"></div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="min-w-0 flex-1">
                                                <div className="text-foreground overflow-hidden text-sm font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <span className="max-w-[200px] truncate">
                                                            {conversationName}
                                                        </span>
                                                        {conversation.hasUnreadMessage && (
                                                            <div className="flex flex-shrink-0 items-center gap-1">
                                                                <span className="rounded-full bg-blue-500 px-2 py-1 text-xs font-medium text-white">
                                                                    New
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {conversation.isGroup ? (
                                                    <div className="mt-0.5 flex items-center gap-1">
                                                        <Users className="text-muted-foreground h-3 w-3 flex-shrink-0" />
                                                        <span className="text-muted-foreground truncate text-xs">
                                                            {
                                                                conversation
                                                                    .participants
                                                                    .length
                                                            }{" "}
                                                            members
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div className="mt-0.5">
                                                        {getConversationRole(
                                                            conversation,
                                                        ) !== undefined ? (
                                                            <Badge
                                                                variant={getRoleBadgeVariant(
                                                                    getConversationRole(
                                                                        conversation,
                                                                    )!,
                                                                )}
                                                                className="h-4 flex-shrink-0 px-1 text-xs"
                                                            >
                                                                {getConversationRoleDisplayText(
                                                                    conversation,
                                                                )}
                                                            </Badge>
                                                        ) : (
                                                            <Badge
                                                                variant={getRoleBadgeVariant(
                                                                    Role.Learner,
                                                                )}
                                                                className="h-4 flex-shrink-0 px-1 text-xs"
                                                            >
                                                                {getRoleDisplayText(
                                                                    Role.Learner,
                                                                )}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
};
