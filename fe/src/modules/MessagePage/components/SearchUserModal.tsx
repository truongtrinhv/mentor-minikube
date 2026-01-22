import { MessageCircle, Search, Users, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

import { Role } from "@/common/types/auth";

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "../../../common/components/ui/avatar";
import { Badge } from "../../../common/components/ui/badge";
import { Button } from "../../../common/components/ui/button";
import { Checkbox } from "../../../common/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../../../common/components/ui/dialog";
import { Input } from "../../../common/components/ui/input";
import type {
    ConversationResponse,
    CreateConversationRequest,
    SearchUserResult,
    UserResponse,
} from "../types";

type SearchUserModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onCreateConversation: (request: CreateConversationRequest) => void;
    searchUsers?: (keyword: string) => Promise<SearchUserResult[]>;
    conversations: ConversationResponse[];
    currentUser: UserResponse;
};

export const SearchUserModal: React.FC<SearchUserModalProps> = ({
    isOpen,
    onClose,
    onCreateConversation,
    searchUsers,
    conversations,
    currentUser,
}) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUsers, setSelectedUsers] = useState<SearchUserResult[]>([]);
    const [conversationName, setConversationName] = useState("");
    const [searchResults, setSearchResults] = useState<SearchUserResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        const performSearch = async () => {
            if (!searchTerm.trim() || !searchUsers) {
                setSearchResults([]);
                return;
            }

            setIsSearching(true);
            try {
                const results = await searchUsers(searchTerm.trim());
                setSearchResults(results);
            } catch (error) {
                console.error("Search error:", error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        };

        const debounceTimer = setTimeout(performSearch, 300);
        return () => clearTimeout(debounceTimer);
    }, [searchTerm, searchUsers]);

    const handleUserSelect = (user: SearchUserResult, checked: boolean) => {
        if (checked) {
            setSelectedUsers((prev) => [...prev, user]);
        } else {
            setSelectedUsers((prev) => prev.filter((u) => u.id !== user.id));
        }
    };

    const handleCreateConversation = () => {
        if (selectedUsers.length === 0) {
            toast.error("Please select at least one user");
            return;
        }

        const trimmedName = conversationName.trim();
        const isGroupConversation = selectedUsers.length >= 2;

        if (!isGroupConversation) {
            const selectedUserId = selectedUsers[0].id;
            const existingConversation = conversations.find(
                (conv) =>
                    !conv.isGroup &&
                    conv.participants.length === 2 &&
                    conv.participants.some((p) => p.id === selectedUserId) &&
                    conv.participants.some((p) => p.id === currentUser.id),
            );

            if (existingConversation) {
                toast.error("You have already chatted with this user.");
                return;
            }
        }

        if (isGroupConversation && trimmedName && trimmedName.length > 255) {
            toast.error("Group name cannot exceed 255 characters");
            return;
        }

        const groupName = isGroupConversation
            ? trimmedName ||
              `Group with ${selectedUsers.map((u) => u.fullName).join(", ")}`
            : undefined;

        const request: CreateConversationRequest = {
            userIds: selectedUsers.map((u) => u.id),
            isGroup: isGroupConversation,
            ...(isGroupConversation && { conversationName: groupName }),
        };

        onCreateConversation(request);
        handleClose();
    };

    const handleConversationNameChange = (value: string) => {
        const trimmedValue = value.trim();
        if (trimmedValue.length <= 255) {
            setConversationName(value);
        } else {
            toast.error("Group name cannot exceed 255 characters");
        }
    };

    const handleClose = () => {
        setSearchTerm("");
        setSelectedUsers([]);
        setConversationName("");
        setSearchResults([]);
        onClose();
    };

    const removeSelectedUser = (userId: string) => {
        setSelectedUsers((prev) => prev.filter((u) => u.id !== userId));
    };

    const getRoleBadgeVariant = (role: Role) => {
        switch (role) {
            case Role.Admin:
                return "destructive";
            case Role.Mentor:
                return "secondary";
            case Role.Learner:
                return "default";
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
            case Role.Learner:
                return "Learner";
            default:
                return "Learner";
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="flex max-h-[80vh] flex-col sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <MessageCircle className="h-5 w-5" />
                        Create new conversation
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 space-y-4">
                    {/* Selected Users */}
                    {selectedUsers.length > 0 && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="text-sm font-medium">
                                    Selected ({selectedUsers.length}):
                                </div>
                                {selectedUsers.length > 5 && (
                                    <div className="text-muted-foreground text-xs">
                                        Scroll to see all
                                    </div>
                                )}
                            </div>
                            <div className="scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent bg-muted/30 max-h-24 overflow-y-auto rounded-lg border p-2">
                                <div className="flex flex-wrap gap-2">
                                    {selectedUsers.map((user) => (
                                        <Badge
                                            key={user.id}
                                            variant="secondary"
                                            className="flex max-w-full items-center gap-1 px-2 py-1"
                                        >
                                            <div className="flex flex-shrink-0 items-center">
                                                <Avatar className="h-4 w-4">
                                                    <AvatarImage
                                                        src={user.avatarUrl}
                                                    />
                                                    <AvatarFallback className="text-xs">
                                                        {user.fullName
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                            </div>

                                            <span className="min-w-0 flex-1 truncate text-xs">
                                                {user.fullName}
                                            </span>

                                            <button
                                                onClick={() =>
                                                    removeSelectedUser(user.id)
                                                }
                                                className="hover:bg-muted flex-shrink-0 rounded-full p-0.5"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Group Name Input */}
                    {selectedUsers.length >= 2 && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Group name (optional):
                            </label>
                            <div className="space-y-1">
                                <Input
                                    placeholder="Enter group name"
                                    value={conversationName}
                                    onChange={(e) =>
                                        handleConversationNameChange(
                                            e.target.value,
                                        )
                                    }
                                    maxLength={255}
                                />
                                <div className="text-muted-foreground flex justify-between text-xs">
                                    <span>Group name (optional)</span>
                                    <span>
                                        {conversationName.trim().length}/255
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Search Users */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Search users:
                        </label>
                        <div className="relative">
                            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                            <Input
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {/* Search Results */}
                        <div className="max-h-48 overflow-y-auto rounded-lg border">
                            {isSearching ? (
                                <div className="text-muted-foreground flex items-center justify-center p-4">
                                    <div className="flex items-center gap-2">
                                        <div className="border-primary h-4 w-4 animate-spin rounded-full border-b-2"></div>
                                        <span className="text-sm">
                                            Searching...
                                        </span>
                                    </div>
                                </div>
                            ) : searchResults.length === 0 ? (
                                <div className="text-muted-foreground flex items-center justify-center p-4">
                                    <div className="text-center">
                                        <Search className="mx-auto mb-2 h-8 w-8 opacity-50" />
                                        <p className="text-sm">
                                            {searchTerm.trim()
                                                ? "No users found"
                                                : "Enter a name to search users"}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-2">
                                    {searchResults.map(
                                        (user: SearchUserResult) => {
                                            const isChecked =
                                                selectedUsers.some(
                                                    (u) => u.id === user.id,
                                                );

                                            return (
                                                <div
                                                    key={user.id}
                                                    className="hover:bg-muted flex cursor-pointer items-center space-x-3 rounded-lg p-3 transition-colors"
                                                    onClick={() =>
                                                        handleUserSelect(
                                                            user,
                                                            !isChecked,
                                                        )
                                                    }
                                                >
                                                    <Checkbox
                                                        checked={isChecked}
                                                        onCheckedChange={(
                                                            checked,
                                                        ) =>
                                                            handleUserSelect(
                                                                user,
                                                                checked as boolean,
                                                            )
                                                        }
                                                        // Ngăn event bubbling để tránh double-click
                                                        onClick={(e) =>
                                                            e.stopPropagation()
                                                        }
                                                    />
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage
                                                            src={user.avatarUrl}
                                                        />
                                                        <AvatarFallback>
                                                            {user.fullName
                                                                .charAt(0)
                                                                .toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1">
                                                        <div className="font-medium">
                                                            {user.fullName}
                                                        </div>
                                                        <div className="text-muted-foreground text-xs capitalize">
                                                            <div className="mt-1">
                                                                <Badge
                                                                    variant={getRoleBadgeVariant(
                                                                        user?.role !==
                                                                            undefined
                                                                            ? user.role
                                                                            : Role.Learner,
                                                                    )}
                                                                    className="text-xs"
                                                                >
                                                                    {getRoleDisplayText(
                                                                        user?.role !==
                                                                            undefined
                                                                            ? user.role
                                                                            : Role.Learner,
                                                                    )}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        },
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCreateConversation}
                        disabled={selectedUsers.length === 0}
                        className="flex items-center gap-2"
                    >
                        <Users className="h-4 w-4" />
                        Create {selectedUsers.length >= 2 ? "group " : ""}
                        conversation
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
