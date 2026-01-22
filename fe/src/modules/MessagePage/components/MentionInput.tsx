import { Users } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "../../../common/components/ui/avatar";
import { Textarea } from "../../../common/components/ui/textarea";
import { cn } from "../../../common/lib/utils";
import type { UserResponse } from "../types";

type MentionInputProps = {
    value: string;
    onChange: (value: string) => void;
    onSendMessage?: () => void;
    participants: UserResponse[];
    currentUser: UserResponse;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
};

type MentionSuggestion = {
    user: UserResponse;
    displayText: string;
};

export const MentionInput: React.FC<MentionInputProps> = ({
    value,
    onChange,
    onSendMessage = () => {},
    participants,
    currentUser,
    placeholder = "Enter message...",
    disabled = false,
    className,
}) => {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestions, setSuggestions] = useState<MentionSuggestion[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [mentionStart, setMentionStart] = useState(-1);
    const [cursorPosition, setCursorPosition] = useState(0);
    const [isComposing, setIsComposing] = useState(false);
    const [isSending, setIsSending] = useState(false);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);

    const availableParticipants = participants.filter(
        (p) => p.id !== currentUser.id,
    );

    const debouncedSendMessage = useCallback(() => {
        if (isSending || isComposing) return;

        setIsSending(true);
        setTimeout(() => {
            if (value.trim() && onSendMessage) {
                onSendMessage();
            }
            setIsSending(false);
        }, 50);
    }, [value, onSendMessage, isSending, isComposing]);

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "auto";
            const newHeight = Math.min(textarea.scrollHeight, 96);
            textarea.style.height = `${newHeight}px`;
            textarea.style.overflowY = newHeight >= 96 ? "auto" : "hidden";
        }
    }, [value]);

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        const position = e.target.selectionStart || 0;

        onChange(newValue);
        setCursorPosition(position);

        // Check for @ mentions
        const lastAtIndex = newValue.lastIndexOf("@", position - 1);

        if (lastAtIndex !== -1) {
            const textAfterAt = newValue.substring(lastAtIndex + 1, position);

            if (!textAfterAt.includes(" ") && textAfterAt.length >= 0) {
                const query = textAfterAt.toLowerCase();

                let filtered;
                if (query === "") {
                    filtered = availableParticipants.map((user) => ({
                        user,
                        displayText: user.fullName,
                    }));
                } else {
                    filtered = availableParticipants
                        .filter((participant) =>
                            participant.fullName.toLowerCase().includes(query),
                        )
                        .map((user) => ({
                            user,
                            displayText: user.fullName,
                        }));
                }

                if (filtered.length > 0) {
                    setSuggestions(filtered);
                    setShowSuggestions(true);
                    setMentionStart(lastAtIndex);
                    setSelectedIndex(0);
                    return;
                }
            }
        }

        setShowSuggestions(false);
    };

    const insertMention = (suggestion: MentionSuggestion) => {
        const beforeMention = value.substring(0, mentionStart);
        const afterMention = value.substring(cursorPosition);

        const mentionText = `@[${suggestion.displayText}]`;
        const newValue = beforeMention + mentionText + " " + afterMention;

        onChange(newValue);
        setShowSuggestions(false);

        setTimeout(() => {
            if (textareaRef.current) {
                const newPosition =
                    beforeMention.length + mentionText.length + 1;
                textareaRef.current.focus();
                textareaRef.current.setSelectionRange(newPosition, newPosition);
            }
        }, 0);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (isComposing) {
            return;
        }

        if (showSuggestions && suggestions.length > 0) {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedIndex((prev) =>
                    prev < suggestions.length - 1 ? prev + 1 : 0,
                );
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedIndex((prev) =>
                    prev > 0 ? prev - 1 : suggestions.length - 1,
                );
            } else if (e.key === "Tab" || e.key === "Enter") {
                if (e.key === "Tab" || !e.shiftKey) {
                    e.preventDefault();
                    insertMention(suggestions[selectedIndex]);
                    return;
                }
            } else if (e.key === "Escape") {
                e.preventDefault();
                setShowSuggestions(false);
            }
        }

        if (
            e.key === "Enter" &&
            !e.shiftKey &&
            !showSuggestions &&
            !isSending
        ) {
            e.preventDefault();
            e.stopPropagation();
            debouncedSendMessage();
        }
    };

    const handleCompositionStart = () => {
        setIsComposing(true);
    };

    const handleCompositionEnd = () => {
        setIsComposing(false);
    };

    const handleBlur = () => {
        setTimeout(() => {
            setShowSuggestions(false);
        }, 150);
    };

    return (
        <div className={cn("relative", className)}>
            <Textarea
                ref={textareaRef}
                value={value}
                onChange={handleInputChange}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                onCompositionStart={handleCompositionStart}
                onCompositionEnd={handleCompositionEnd}
                placeholder={placeholder}
                disabled={disabled}
                className="scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent max-h-24 min-h-10 resize-none py-2 pr-12 break-all"
                rows={1}
            />

            {/* Mention Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
                <div
                    ref={suggestionsRef}
                    className="bg-popover absolute right-0 bottom-full left-0 mb-2 max-h-48 overflow-y-auto rounded-lg border p-1 shadow-lg"
                >
                    <div className="text-muted-foreground flex items-center gap-2 px-3 py-2 text-sm">
                        <Users className="h-4 w-4" />
                        Select a person to mention
                    </div>

                    {suggestions.map((suggestion, index) => (
                        <button
                            key={suggestion.user.id}
                            className={cn(
                                "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors",
                                index === selectedIndex
                                    ? "bg-accent text-accent-foreground"
                                    : "hover:bg-accent/50",
                            )}
                            onClick={() => insertMention(suggestion)}
                            onMouseEnter={() => setSelectedIndex(index)}
                        >
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={suggestion.user.avatarUrl} />
                                <AvatarFallback className="text-xs">
                                    {suggestion.user.fullName
                                        .charAt(0)
                                        .toUpperCase()}
                                </AvatarFallback>
                            </Avatar>

                            <div className="min-w-0 flex-1">
                                <div className="font-medium">
                                    {suggestion.user.fullName}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
