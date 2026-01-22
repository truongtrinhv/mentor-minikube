import {
    File,
    Image as ImageIcon,
    Paperclip,
    Send,
    Users,
    X,
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { useHubContext } from "@/common/context/auth-context";

import { LoadingSpinner } from "./LoadingSpinner";
import { MembersModal } from "./MembersModal";
import { MentionInput } from "./MentionInput";
import { MessageItem } from "./MessageItem";
import { convertMentionsToUserIds } from "./ParseMention";

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "../../../common/components/ui/avatar";
import { Badge } from "../../../common/components/ui/badge";
import { Button } from "../../../common/components/ui/button";
import { Textarea } from "../../../common/components/ui/textarea";
import { cn } from "../../../common/lib/utils";
import { Role } from "../../../common/types/auth";
import conversationService from "../services/conversationService";
import type {
    ConversationResponse,
    FileMessageRequest,
    MessageResponse,
    SendMessageRequest,
    UserResponse,
} from "../types";

type ChatAreaProps = {
    conversation: ConversationResponse | null;
    messages: MessageResponse[];
    currentUser: UserResponse;
    onSendMessage: (request: SendMessageRequest) => void;
    hasMore: boolean;
    isLoading: boolean;
    lastMessageElementRef: (node: HTMLDivElement | null) => void;
    onLeaveGroup?: (conversationId: string) => void;
};

type AttachmentPreview = {
    id: string;
    file: File;
    url: string;
    type: "image" | "file";
};

export const ChatArea: React.FC<ChatAreaProps> = ({
    conversation,
    messages,
    currentUser,
    onSendMessage,
    hasMore,
    isLoading,
    lastMessageElementRef,
    onLeaveGroup,
}) => {
    const { hubConnectionState } = useHubContext();
    const [messageText, setMessageText] = useState("");
    const [attachments, setAttachments] = useState<AttachmentPreview[]>([]);
    const [showMembersModal, setShowMembersModal] = useState(false);
    const [isSendingFile, setIsSendingFile] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isScrolledToBottomRef = useRef(true);
    const prevMessagesLength = useRef(messages.length);

    // Helper function to normalize text consistently
    const normalizeText = (text: string): string => {
        return text.replace(/\r\n/g, "\n").trim();
    };

    // Helper function to count characters excluding line breaks
    const getCharacterCount = (text: string): number => {
        return text.replace(/\r\n/g, "").replace(/[\r\n]/g, "").length;
    };

    // Track scroll position and handle infinite scroll
    const handleScroll = useCallback(() => {
        if (!scrollContainerRef.current) return;

        const { scrollTop, scrollHeight, clientHeight } =
            scrollContainerRef.current;
        const isAtBottom = scrollHeight - (scrollTop + clientHeight) < 50;
        isScrolledToBottomRef.current = isAtBottom;

        if (scrollTop < 100 && hasMore && !isLoading) {
            const timer = setTimeout(() => {
                if (scrollContainerRef.current) {
                    scrollContainerRef.current.scrollTop = 150;
                }
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [hasMore, isLoading]);

    // Add scroll event listener
    useEffect(() => {
        const scrollContainer = scrollContainerRef.current;
        if (scrollContainer) {
            scrollContainer.addEventListener("scroll", handleScroll);
            return () => {
                scrollContainer.removeEventListener("scroll", handleScroll);
            };
        }
    }, [handleScroll]);

    const scrollToBottom = useCallback((behavior: ScrollBehavior = "auto") => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior });
        }
    }, []);

    // Scroll to bottom when new messages are received or conversation changes
    useEffect(() => {
        if (messages.length === 0) return;

        const lastMessage = messages[messages.length - 1];
        const isOwnMessage = lastMessage?.senderId === currentUser.id;

        if (isScrolledToBottomRef.current || isOwnMessage) {
            scrollToBottom(isOwnMessage ? "smooth" : "auto");
        }

        prevMessagesLength.current = messages.length;
    }, [messages, currentUser.id, scrollToBottom]);

    useEffect(() => {
        if (conversation?.id) {
            isScrolledToBottomRef.current = true;
            scrollToBottom("auto");
        }
    }, [conversation?.id, scrollToBottom]);

    useEffect(() => {
        if (conversation?.id) {
            setMessageText("");
            attachments.forEach((attachment) => {
                URL.revokeObjectURL(attachment.url);
            });
            setAttachments([]);
            setIsSendingFile(false);
        }
    }, [conversation?.id]);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;

        const newAttachments: AttachmentPreview[] = [];

        Array.from(files).forEach((file) => {
            if (file.size > 10 * 1024 * 1024) {
                toast.error(
                    `File "${file.name}" is too large. Maximum size is 10MB.`,
                );
                return;
            }

            const isImage = file.type.startsWith("image/");
            const allowedTypes = [
                // Video
                "video/mp4",
                "video/x-msvideo", // avi
                "video/quicktime", // mov
                "video/x-ms-wmv", // wmv
                "video/webm",
                // Documents
                "application/pdf",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // docx
                "application/msword", // doc
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // xlsx
                "application/vnd.ms-excel", // xls
                "application/vnd.openxmlformats-officedocument.presentationml.presentation", // pptx
                "application/vnd.ms-powerpoint", // ppt
                "text/plain",
                // Images
                "image/jpeg", // jpg, jpeg
                "image/png",
                "image/gif",
                "image/webp",
                "image/svg+xml",
            ];

            if (!allowedTypes.includes(file.type)) {
                toast.error(`File type "${file.type}" is not supported.`);
                return;
            }

            const url = URL.createObjectURL(file);
            const attachment: AttachmentPreview = {
                id: `${Date.now()}-${Math.random()}`,
                file,
                url,
                type: isImage ? "image" : "file",
            };

            newAttachments.push(attachment);
        });

        setAttachments((prev) => [...prev, ...newAttachments]);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const removeAttachment = (id: string) => {
        setAttachments((prev) => {
            const attachment = prev.find((a) => a.id === id);
            if (attachment) {
                URL.revokeObjectURL(attachment.url);
            }
            return prev.filter((a) => a.id !== id);
        });
    };

    const handleSendMessage = async () => {
        if (!messageText.trim() && attachments.length === 0) return;
        if (!conversation) return;

        const hasAttachment = attachments.length > 0;

        if (messageText && getCharacterCount(messageText) > 5000) {
            toast.error("Message cannot exceed 5000 characters");
            return;
        }

        const trimmedMessageText = normalizeText(messageText);

        try {
            if (hasAttachment) {
                setIsSendingFile(true);
                const convertedContent = convertMentionsToUserIds(
                    trimmedMessageText,
                    conversation.participants,
                );

                const fileRequest: FileMessageRequest = {
                    conversationId: conversation.id,
                    content: convertedContent,
                    files: [],
                };

                for (const attachment of attachments) {
                    fileRequest.files.push(attachment.file);
                }

                const result =
                    await conversationService.sendFileMessage(fileRequest);

                if (!result.isSuccess) {
                    throw new Error(
                        result.errors?.[0]?.message ||
                            "Failed to send file message",
                    );
                } else {
                    toast.success("File(s) sent successfully!");
                }
            } else {
                const convertedContent = convertMentionsToUserIds(
                    trimmedMessageText,
                    conversation.participants,
                );

                const request: SendMessageRequest = {
                    conversationId: conversation.id,
                    content: convertedContent,
                };

                onSendMessage(request);
            }

            setMessageText("");
            attachments.forEach((attachment) => {
                URL.revokeObjectURL(attachment.url);
            });
            setAttachments([]);
        } catch (error) {
            console.error("Send message error:", error);
            toast.error("Failed to send message. Please try again.");
        } finally {
            setIsSendingFile(false);
        }
    };

    const getConnectionStatusColor = () => {
        switch (hubConnectionState) {
            case "Connected":
                return "bg-green-500";
            case "Connecting":
            case "Disconnecting":
                return "bg-yellow-500";
            case "Disconnected":
            default:
                return "bg-red-500";
        }
    };

    const getConnectionStatusText = () => {
        switch (hubConnectionState) {
            case "Connected":
                return "Connected";
            case "Connecting":
                return "Connecting...";
            case "Disconnecting":
                return "Disconnecting...";
            case "Disconnected":
            default:
                return "Disconnected";
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

    const getConversationName = () => {
        if (!conversation) return "";
        if (conversation.isGroup) {
            return conversation.conversationName || "Group chat";
        }
        const otherUser = getOtherParticipant(conversation);
        return otherUser?.fullName || "User";
    };

    const getConversationAvatar = () => {
        if (!conversation || conversation.isGroup) return undefined;
        const otherUser = getOtherParticipant(conversation);
        return otherUser?.avatarUrl;
    };

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

    const handleLeaveGroup = () => {
        if (conversation && onLeaveGroup) {
            onLeaveGroup(conversation.id);
        }
    };

    if (!conversation) {
        return (
            <>
                {/* Empty Header */}
                <div className="border-border bg-card flex h-[72px] min-h-[72px] flex-shrink-0 items-center justify-between border-b p-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-full">
                            <Users className="text-muted-foreground h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-muted-foreground font-semibold">
                                Select a conversation
                            </h3>
                            <div className="text-muted-foreground text-sm">
                                Choose from the list on the left
                            </div>
                        </div>
                    </div>

                    {/* Connection Status */}
                    <div className="flex items-center gap-2">
                        <div
                            className={`h-2 w-2 rounded-full ${getConnectionStatusColor()}`}
                            title={getConnectionStatusText()}
                        />
                        <span className="text-muted-foreground text-xs">
                            {getConnectionStatusText()}
                        </span>
                    </div>
                </div>

                {/* Empty State */}
                <div className="text-muted-foreground flex flex-1 items-center justify-center text-center">
                    <div>
                        <div className="bg-muted mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                            <Users className="h-8 w-8" />
                        </div>
                        <h3 className="mb-2 text-lg font-medium">
                            Select a conversation
                        </h3>
                        <p className="text-sm">
                            Select a conversation from the left sidebar to start
                            messaging
                        </p>
                    </div>
                </div>

                {/* Disabled Input */}
                <div className="border-border bg-card flex-shrink-0 border-t p-4">
                    <div className="flex max-w-full items-end gap-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            disabled
                            className="h-10 w-10 flex-shrink-0 p-0"
                        >
                            <Paperclip className="h-4 w-4" />
                        </Button>
                        <div className="relative flex-1">
                            <Textarea
                                placeholder="Select a conversation to start messaging..."
                                disabled
                                className="max-h-24 min-h-10 resize-none py-2 pr-12 opacity-50"
                                rows={1}
                            />
                        </div>
                        <Button
                            size="sm"
                            disabled
                            className="h-10 flex-shrink-0 px-4"
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            {/* Chat Header - Fixed */}
            <div className="border-border bg-card flex h-[72px] min-h-[72px] flex-shrink-0 items-center justify-between border-b p-4">
                <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="relative">
                        <Avatar className="h-10 w-10">
                            {conversation.isGroup ? (
                                <div className="bg-primary/10 flex h-full w-full items-center justify-center">
                                    <Users className="text-primary h-5 w-5" />
                                </div>
                            ) : (
                                <>
                                    <AvatarImage
                                        src={getConversationAvatar()}
                                    />
                                    <AvatarFallback>
                                        {getConversationName()
                                            .charAt(0)
                                            .toUpperCase()}
                                    </AvatarFallback>
                                </>
                            )}
                        </Avatar>
                    </div>

                    {/* Info */}
                    <div>
                        <h3 className="max-w-[600px] truncate font-semibold">
                            {getConversationName()}
                        </h3>
                        <div className="text-muted-foreground text-sm">
                            {conversation.isGroup ? (
                                <button
                                    onClick={() => setShowMembersModal(true)}
                                    className="cursor-pointer transition-colors hover:text-blue-500"
                                >
                                    {conversation.participants.length} members
                                </button>
                            ) : (
                                <Badge
                                    variant={getRoleBadgeVariant(
                                        getConversationRole(conversation)!,
                                    )}
                                    className="text-xs"
                                >
                                    {getConversationRoleDisplayText(
                                        conversation,
                                    )}
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>

                {/* Connection Status */}
                <div className="flex items-center gap-2">
                    <div
                        className={`h-2 w-2 rounded-full ${getConnectionStatusColor()}`}
                        title={getConnectionStatusText()}
                    />
                    <span className="text-muted-foreground text-xs">
                        {getConnectionStatusText()}
                    </span>
                </div>
            </div>

            {/* Messages Container - Scrollable */}
            <div className="relative flex flex-1 flex-col overflow-hidden">
                <div
                    ref={scrollContainerRef}
                    className="scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent flex-1 overflow-y-auto px-4"
                >
                    <div className="flex min-h-full flex-col py-4">
                        {/* Infinite Scroll Loading at Top */}
                        {hasMore && (
                            <div
                                ref={lastMessageElementRef}
                                className="text-muted-foreground flex items-center justify-center gap-2 p-4 text-sm"
                            >
                                <LoadingSpinner
                                    size="sm"
                                    text="Loading older messages..."
                                />
                            </div>
                        )}

                        {messages.length === 0 ? (
                            <div className="text-muted-foreground flex flex-1 items-center justify-center py-8 text-center">
                                <div>
                                    <div className="bg-muted mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full">
                                        <Send className="h-6 w-6" />
                                    </div>
                                    <p>No messages yet</p>
                                    <p className="text-sm">
                                        Send the first message to start the
                                        conversation
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {messages.map((message, index) => {
                                    const prevMessage =
                                        index > 0 ? messages[index - 1] : null;

                                    const showAvatar =
                                        !prevMessage ||
                                        prevMessage.senderId !==
                                            message.senderId;

                                    return (
                                        <div
                                            key={message.id}
                                            className={cn(
                                                "relative",
                                                showAvatar ? "mb-3" : "mb-1",
                                            )}
                                        >
                                            <MessageItem
                                                message={message}
                                                currentUser={currentUser}
                                                participants={
                                                    conversation.participants
                                                }
                                                isGroup={conversation.isGroup}
                                                showAvatar={showAvatar}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                </div>
            </div>

            {/* Message Input - Fixed at Bottom */}
            <div className="border-border bg-card flex-shrink-0 border-t p-4">
                {/* Attachment Previews */}
                {attachments.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-2">
                        {attachments.map((attachment) => (
                            <div
                                key={attachment.id}
                                className="bg-muted relative flex items-center gap-2 rounded-lg p-2"
                            >
                                {attachment.type === "image" ? (
                                    <>
                                        <ImageIcon className="text-muted-foreground h-4 w-4" />
                                        <img
                                            src={attachment.url}
                                            alt={attachment.file.name}
                                            className="h-8 w-8 rounded object-cover"
                                        />
                                    </>
                                ) : (
                                    <File className="text-muted-foreground h-4 w-4" />
                                )}
                                <span className="max-w-[100px] truncate text-sm">
                                    {attachment.file.name}
                                </span>
                                <button
                                    onClick={() =>
                                        removeAttachment(attachment.id)
                                    }
                                    className="text-muted-foreground hover:text-foreground ml-1"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex max-w-full items-end gap-3">
                    {/* Attachment Button */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        multiple
                        accept="image/*,.pdf,.ppt,.pptx,.txt,.doc,.docx,.xls,.xlsx,.mp4,.avi,.mov,.wmv,.webm"
                        className="hidden"
                    />
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-10 w-10 flex-shrink-0 p-0"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={
                            hubConnectionState !== "Connected" || isSendingFile
                        }
                    >
                        <Paperclip className="h-4 w-4" />
                    </Button>

                    {/* Message Input */}
                    <div className="relative flex-1">
                        <MentionInput
                            value={messageText}
                            onChange={setMessageText}
                            onSendMessage={() => {
                                const normalizedText =
                                    normalizeText(messageText);
                                if (
                                    normalizedText &&
                                    getCharacterCount(messageText) <= 5000
                                ) {
                                    handleSendMessage();
                                }
                            }}
                            participants={conversation.participants}
                            currentUser={currentUser}
                            placeholder={
                                hubConnectionState === "Connected"
                                    ? "Enter message..."
                                    : "Connecting to server..."
                            }
                            disabled={
                                hubConnectionState !== "Connected" ||
                                isSendingFile
                            }
                            className="flex-1"
                        />
                    </div>

                    {/* Send Button */}
                    <Button
                        onClick={handleSendMessage}
                        disabled={
                            (!normalizeText(messageText) &&
                                attachments.length === 0) ||
                            getCharacterCount(messageText) > 5000 ||
                            hubConnectionState !== "Connected" ||
                            isSendingFile
                        }
                        size="sm"
                        className="h-10 flex-shrink-0 px-4"
                    >
                        {isSendingFile ? (
                            <LoadingSpinner size="sm" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            </div>

            {/* Members Modal */}
            {conversation && (
                <MembersModal
                    conversation={conversation}
                    currentUser={currentUser}
                    isOpen={showMembersModal}
                    onClose={() => setShowMembersModal(false)}
                    onLeaveGroup={handleLeaveGroup}
                />
            )}
        </>
    );
};
