import React, { useEffect, useState } from "react";

import { useAuthContext, useHubContext } from "@/common/context/auth-context";

import { ChatArea, ConversationList, SearchUserModal } from "./components";
import { useInfiniteMessages } from "./hooks/useInfiniteMessages";
import type {
    ChatState,
    ConversationResponse,
    CreateConversationRequest,
    SendMessageRequest,
} from "./types";

export const MessagePage: React.FC = () => {
    const { user } = useAuthContext();
    const {
        dataCenter,
        createConversation,
        sendMessage,
        searchUser,
        leaveGroup,
        readConversation,
        setActiveConversationId,
    } = useHubContext();

    const [chatState, setChatState] = useState<ChatState>({
        conversations: [],
        currentConversation: null,
        messages: [],
        isLoading: false,
        error: null,
    });

    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

    // Cleanup current conversation on unmount
    useEffect(() => {
        return () => {
            setChatState((prev) => ({
                ...prev,
                currentConversation: null,
            }));
            setActiveConversationId(undefined);
        };
    }, [setActiveConversationId]);

    // Update conversations from hub data center
    useEffect(() => {
        if (dataCenter?.conversations) {
            setChatState((prev) => {
                const currentConvId = prev.currentConversation?.id;
                const updatedCurrentConversation = currentConvId
                    ? dataCenter.conversations.find(
                          (conv) => conv.id === currentConvId,
                      )
                    : null;

                return {
                    ...prev,
                    conversations: dataCenter.conversations,
                    currentConversation:
                        updatedCurrentConversation || prev.currentConversation,
                    isLoading: false,
                };
            });
        } else {
            setChatState((prev) => ({
                ...prev,
                isLoading: !dataCenter,
            }));
        }
    }, [dataCenter?.conversations]);

    const {
        messages,
        hasMore,
        isLoading: isLoadingMessages,
        lastMessageElementRef,
    } = useInfiniteMessages({
        conversationId: chatState.currentConversation?.id || null,
        currentConversation: chatState.currentConversation,
    });

    const handleSelectConversation = async (
        conversation: ConversationResponse,
    ) => {
        setChatState((prev) => ({
            ...prev,
            currentConversation: null,
        }));

        setChatState((prev) => ({
            ...prev,
            currentConversation: conversation,
        }));

        setActiveConversationId(conversation.id);

        try {
            readConversation(conversation.id);
        } catch (error) {
            console.error("Failed to mark conversation as read:", error);
        }
    };

    const handleCreateConversation = async (
        request: CreateConversationRequest,
    ) => {
        setChatState((prev) => ({ ...prev, isLoading: true }));

        try {
            const hubRequest = {
                userIds: request.userIds,
                isGroup: request.isGroup,
                conversationName: request.conversationName || undefined,
            };

            const currentConversationIds = new Set(
                chatState.conversations.map((conv) => conv.id),
            );

            const success = await createConversation(hubRequest as any);
            if (success) {
                setIsSearchModalOpen(false);
                setTimeout(() => {
                    setChatState((prev) => {
                        const newConversation = prev.conversations.find(
                            (conv) => !currentConversationIds.has(conv.id),
                        );

                        if (newConversation) {
                            setActiveConversationId(newConversation.id);
                            readConversation(newConversation.id);

                            return {
                                ...prev,
                                currentConversation: newConversation,
                                isLoading: false,
                            };
                        }

                        return { ...prev, isLoading: false };
                    });
                }, 300);
            } else {
                throw new Error("Failed to create conversation");
            }
        } catch (error) {
            console.error("Create conversation error:", error);
            setChatState((prev) => ({
                ...prev,
                error: "Failed to create conversation",
                isLoading: false,
            }));
        }
    };

    const handleSendMessage = async (request: SendMessageRequest) => {
        if (!chatState.currentConversation) return;

        try {
            const hubRequest = {
                conversationId: request.conversationId,
                content: request.content,
            };

            const success = await sendMessage(hubRequest as any);
            if (!success) {
                throw new Error("Failed to send message");
            }
        } catch (error) {
            console.error("Send message error:", error);
            setChatState((prev) => ({
                ...prev,
                error: "Failed to send message",
            }));
        }
    };

    const handleLeaveGroup = async (conversationId: string) => {
        try {
            const success = await leaveGroup(conversationId);
            if (!success) {
                throw new Error("Failed to leave group");
            }

            // Remove conversation from state
            setChatState((prev) => ({
                ...prev,
                conversations: prev.conversations.filter(
                    (conv) => conv.id !== conversationId,
                ),
                currentConversation:
                    prev.currentConversation?.id === conversationId
                        ? null
                        : prev.currentConversation,
            }));
        } catch (error) {
            console.error("Leave group error:", error);
            setChatState((prev) => ({
                ...prev,
                error: "Failed to leave group",
            }));
        }
    };

    if (!user) {
        return (
            <div className="bg-background border-border flex h-[calc(100vh-8rem)] items-center justify-center rounded-lg border">
                <div className="text-center">
                    <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
                    <p className="text-muted-foreground">Loading user...</p>
                </div>
            </div>
        );
    }

    const currentUserAsResponse = user as any;

    if (
        chatState.isLoading &&
        (chatState.conversations?.length === 0 || !chatState.conversations)
    ) {
        return (
            <div className="bg-background border-border flex h-[calc(100vh-8rem)] items-center justify-center rounded-lg border">
                <div className="text-center">
                    <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
                    <p className="text-muted-foreground">
                        Loading conversations...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-background border-border flex h-[calc(100vh-8rem)] flex-col overflow-hidden rounded-lg border shadow-lg md:flex-row">
            {/* Left Panel - Conversation List */}
            <div className="border-border bg-card flex h-64 w-full flex-col overflow-hidden rounded-t-lg border-b md:h-full md:w-[350px] md:min-w-[350px] md:rounded-l-lg md:rounded-tr-none md:border-r md:border-b-0">
                <ConversationList
                    conversations={chatState.conversations}
                    currentConversation={chatState.currentConversation}
                    currentUser={currentUserAsResponse}
                    onSelectConversation={handleSelectConversation}
                    onCreateConversation={() => setIsSearchModalOpen(true)}
                />
            </div>

            {/* Right Panel - Chat Area */}
            <div className="bg-background relative flex h-full flex-1 flex-col overflow-hidden rounded-b-lg md:rounded-r-lg md:rounded-bl-none">
                <ChatArea
                    key={chatState.currentConversation?.id}
                    conversation={chatState.currentConversation}
                    messages={messages}
                    currentUser={currentUserAsResponse}
                    onSendMessage={handleSendMessage}
                    hasMore={hasMore}
                    isLoading={isLoadingMessages}
                    lastMessageElementRef={lastMessageElementRef}
                    onLeaveGroup={handleLeaveGroup}
                />
            </div>

            {/* Search User Modal */}
            <SearchUserModal
                isOpen={isSearchModalOpen}
                onClose={() => setIsSearchModalOpen(false)}
                onCreateConversation={handleCreateConversation}
                conversations={chatState.conversations}
                currentUser={currentUserAsResponse}
                searchUsers={async (keyword: string) => {
                    const results = await searchUser(keyword);
                    return results as any;
                }}
            />
        </div>
    );
};

export default MessagePage;
