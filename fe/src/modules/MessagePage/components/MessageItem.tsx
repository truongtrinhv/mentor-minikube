import {
    Archive,
    Download,
    File,
    FileSpreadsheet,
    FileText,
    Image as ImageIcon,
    Music,
    Video,
} from "lucide-react";
import React, { useState } from "react";

import { parseMentions } from "./ParseMention";

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "../../../common/components/ui/avatar";
import { Button } from "../../../common/components/ui/button";
import { cn } from "../../../common/lib/utils";
import type {
    AttachmentResponse,
    MessageResponse,
    UserResponse,
} from "../types";
import { formatMessageTimestamp } from "../utils/time";

type MessageItemProps = {
    message: MessageResponse;
    currentUser: UserResponse;
    participants: UserResponse[];
    isGroup: boolean;
    showAvatar?: boolean;
};

export const MessageItem: React.FC<MessageItemProps> = ({
    message,
    currentUser,
    participants,
    isGroup,
    showAvatar = true,
}) => {
    const isOwnMessage = message.senderId === currentUser.id;
    const isEmtpyContent = message.content === "";

    // Find sender in participants, if not found, create a former member object
    const participantSender = participants.find(
        (p) => p.id === message.senderId,
    );
    const sender = participantSender || {
        id: message.senderId,
        fullName: "Former Member",
        avatarUrl: "",
        role: 2,
    };

    const [imageError, setImageError] = useState<string[]>([]);

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const getFileIcon = (fileName: string, type: string | undefined) => {
        const extension = fileName.split(".").pop()?.toLowerCase() || "";

        // Based on backend type
        if (type?.toLowerCase() === "image")
            return <ImageIcon className="h-5 w-5 text-blue-500" />;
        if (type?.toLowerCase() === "video")
            return <Video className="h-5 w-5 text-purple-500" />;

        // Based on file extension for more specific icons
        if (["pdf"].includes(extension))
            return <FileText className="h-5 w-5 text-red-500" />;
        if (["doc", "docx"].includes(extension))
            return <FileText className="h-5 w-5 text-blue-600" />;
        if (["xls", "xlsx"].includes(extension))
            return <FileSpreadsheet className="h-5 w-5 text-green-600" />;
        if (["mp3", "wav", "flac"].includes(extension))
            return <Music className="h-5 w-5 text-pink-500" />;
        if (["zip", "rar", "7z"].includes(extension))
            return <Archive className="h-5 w-5 text-orange-500" />;
        if (["txt", "md"].includes(extension))
            return <FileText className="h-5 w-5 text-gray-500" />;

        return <File className="h-5 w-5 text-gray-400" />;
    };

    const getFileTypeColor = (fileName: string, type: string | undefined) => {
        const extension = fileName.split(".").pop()?.toLowerCase() || "";

        if (type?.toLowerCase() === "image")
            return "bg-blue-50 border-blue-200";
        if (type?.toLowerCase() === "video")
            return "bg-purple-50 border-purple-200";
        if (["pdf"].includes(extension)) return "bg-red-50 border-red-200";
        if (["doc", "docx"].includes(extension))
            return "bg-blue-50 border-blue-200";
        if (["xls", "xlsx"].includes(extension))
            return "bg-green-50 border-green-200";

        return "bg-gray-50 border-gray-200";
    };

    const renderMentions = (content: string) => {
        return parseMentions(content, participants, currentUser);
    };

    const downloadFile = async (url: string, fileName: string) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = downloadUrl;
            link.download = fileName;
            link.click();
            window.URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            console.error("Download failed:", error);
            const link = document.createElement("a");
            link.href = url;
            link.download = fileName;
            link.target = "_blank";
            link.click();
        }
    };

    const renderAttachmentPreview = (attachment: AttachmentResponse) => {
        const isImage = attachment.type?.toLowerCase() === "image" || false;
        const fileName = attachment.url.split("/").pop() || "File";
        const hasError = imageError.includes(attachment.id);

        if (isImage && !hasError) {
            return (
                <div
                    className="group mt-2 cursor-pointer"
                    onClick={() => downloadFile(attachment.url, fileName)}
                >
                    <div className="relative max-w-sm">
                        <img
                            src={attachment.url}
                            alt={fileName}
                            className="w-full cursor-pointer rounded-lg border shadow-sm transition-all hover:shadow-md"
                            onError={() =>
                                setImageError((prev) => [
                                    ...prev,
                                    attachment.id,
                                ])
                            }
                            style={{ maxHeight: "250px", objectFit: "cover" }}
                        />

                        {/* Overlay buttons */}
                        <div className="bg-opacity-0 group-hover:bg-opacity-20 absolute inset-0 flex items-center justify-center rounded-lg opacity-0 transition-all group-hover:opacity-100">
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    className="h-8 w-8 p-0 shadow-lg"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        downloadFile(attachment.url, fileName);
                                    }}
                                    title="Download image"
                                >
                                    <Download className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
                        <ImageIcon className="h-3 w-3" />
                        {fileName} • {formatFileSize(attachment.size)}
                    </div>
                </div>
            );
        }

        // Non-image files or failed images
        return (
            <div
                className={cn(
                    "group mt-2 flex max-w-sm cursor-pointer items-center gap-3 rounded-lg border p-3 shadow-sm transition-all hover:shadow-md",
                    getFileTypeColor(fileName, attachment.type),
                    isOwnMessage ? "ml-auto" : "mr-auto",
                )}
                onClick={() => downloadFile(attachment.url, fileName)}
            >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/80 shadow-sm">
                    {getFileIcon(fileName, attachment.type)}
                </div>

                <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-gray-900">
                        {fileName}
                    </div>
                    <div className="text-muted-foreground mt-0.5 text-xs">
                        {formatFileSize(attachment.size)}
                        {attachment.type && (
                            <span className="ml-1 rounded bg-white/50 px-1.5 py-0.5 text-xs font-medium">
                                {attachment.type.toUpperCase()}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                            e.stopPropagation();
                            downloadFile(attachment.url, fileName);
                        }}
                        title="Download file"
                    >
                        <Download className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        );
    };

    return (
        <div
            className={cn(
                "flex gap-2",
                isOwnMessage ? "flex-row-reverse" : "flex-row",
                !showAvatar && "ml-1",
            )}
        >
            {/* Avatar */}
            {showAvatar && !isOwnMessage && (
                <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={sender.avatarUrl} />
                    <AvatarFallback
                        className={cn(
                            "text-xs",
                            !participantSender && "bg-gray-400 text-white",
                        )}
                    >
                        {sender.fullName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
            )}

            {/* Invisible spacer when no avatar but we need alignment */}
            {!showAvatar && !isOwnMessage && (
                <div className="h-8 w-8 flex-shrink-0"></div>
            )}

            {/* Message Content */}
            <div
                className={cn(
                    "flex max-w-[70%] flex-col",
                    isOwnMessage ? "items-end" : "items-start",
                )}
            >
                {/* Sender Name - only show for first message from user */}
                {!isOwnMessage && isGroup && showAvatar && (
                    <div className="mb-1 flex items-center gap-2">
                        <span
                            className={cn(
                                "text-sm font-medium",
                                !participantSender
                                    ? "text-muted-foreground italic"
                                    : "text-foreground",
                            )}
                        >
                            {sender.fullName}
                        </span>
                    </div>
                )}

                {/* Message Bubble */}
                {!isEmtpyContent && (
                    <div
                        className={cn(
                            "max-w-full rounded-lg px-3 py-2 break-words shadow-sm transition-all hover:shadow-md",
                            isOwnMessage
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted",
                            showAvatar
                                ? isOwnMessage
                                    ? "rounded-br-sm"
                                    : "rounded-bl-sm"
                                : isOwnMessage
                                  ? "rounded-r-sm"
                                  : "rounded-l-sm",
                        )}
                    >
                        {/* Text Content */}
                        <div className="text-sm">
                            {renderMentions(message.content)}
                        </div>
                    </div>
                )}

                {/* Attachments */}
                {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-2 w-full space-y-2">
                        {message.attachments.map(
                            (attachment: AttachmentResponse) => (
                                <div key={attachment.id}>
                                    {renderAttachmentPreview(attachment)}
                                </div>
                            ),
                        )}
                    </div>
                )}

                {/* Timestamp - only show for last message in group or on hover */}
                <div
                    className={cn(
                        "text-muted-foreground mt-0.5 px-1 text-xs opacity-60 transition-opacity hover:opacity-100",
                        isOwnMessage ? "text-right" : "text-left",
                    )}
                >
                    {message.createdAt
                        ? formatMessageTimestamp(message.createdAt)
                        : "No timestamp"}
                </div>
            </div>

            {/* Spacer for own messages to maintain alignment */}
            {showAvatar && isOwnMessage && (
                <div className="w-8 flex-shrink-0"></div>
            )}
        </div>
    );
};
