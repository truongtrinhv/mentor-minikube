import React from "react";

import { Badge } from "@/common/components/ui/badge";
import { cn } from "@/common/lib/utils";

import type { UserResponse } from "../types";

// Utility function to parse mentions in text
export const parseMentions = (
    content: string,
    participants: UserResponse[],
    currentUser: UserResponse,
) => {
    const lines = content.split("\n");

    return lines.map((line, lineIndex) => {
        // Regex to match format @[userID or displayName]
        const mentionRegex = /@\[([^\]]+)\]/g;
        const parts: React.ReactNode[] = [];
        let lastIndex = 0;
        let match;
        let hasMentions = false;

        while ((match = mentionRegex.exec(line)) !== null) {
            hasMentions = true;
            if (match.index > lastIndex) {
                parts.push(line.substring(lastIndex, match.index));
            }

            const mentionValue = match[1];

            // First try to find by UUID (exact match)
            let mentionedUser = participants.find((p) => p.id === mentionValue);

            // If not found by UUID, try to find by exact display name match
            if (!mentionedUser) {
                mentionedUser = participants.find(
                    (p) => p.fullName === mentionValue,
                );
            }

            // If user is not found in participants
            if (!mentionedUser) {
                const isUUID =
                    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
                        mentionValue,
                    );

                // If it's a UUID but user not found, they likely left the group
                if (isUUID) {
                    parts.push(
                        <span
                            key={`mention-text-${lineIndex}-${match.index}`}
                            className="text-muted-foreground"
                        >
                            @FormerMember
                        </span>,
                    );
                } else {
                    // If it's not a UUID, treat as regular text (user might be typing)
                    parts.push(
                        <span key={`mention-text-${lineIndex}-${match.index}`}>
                            @[{mentionValue}]
                        </span>,
                    );
                }
            } else {
                const isCurrentUser = mentionedUser?.id === currentUser.id;

                parts.push(
                    <Badge
                        key={`mention-${lineIndex}-${match.index}`}
                        variant={isCurrentUser ? "default" : "secondary"}
                        className={cn(
                            "mx-1 inline-flex max-w-full items-center gap-1 px-2 py-1 text-xs font-medium",
                            isCurrentUser
                                ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                                : "bg-blue-100 text-blue-800 hover:bg-blue-200",
                        )}
                    >
                        <span className="min-w-0 flex-1 truncate">
                            @{mentionedUser.fullName}
                        </span>
                    </Badge>,
                );
            }

            lastIndex = match.index + match[0].length;
        }

        if (lastIndex < line.length) {
            parts.push(line.substring(lastIndex));
        } else if (line === "" && content.includes("\n")) {
            parts.push(<br key={`empty-line-${lineIndex}`} />);
        }

        const lineContent =
            hasMentions || line.includes("@[")
                ? parts
                : line || <br key={`empty-line-${lineIndex}`} />;

        return (
            <React.Fragment key={`line-${lineIndex}`}>
                {lineContent}
                {lineIndex < lines.length - 1 && <br />}
            </React.Fragment>
        );
    });
};

// Utility function to convert mentions from displayName to userID
export const convertMentionsToUserIds = (
    content: string,
    participants: UserResponse[],
): string => {
    return content.replace(/@\[([^\]]+)\]/g, (match, displayName) => {
        const user = participants.find((p) => p.fullName === displayName);
        return user ? `@[${user.id}]` : match;
    });
};
