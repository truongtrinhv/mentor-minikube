import { Crown, LogOut, Users } from "lucide-react";
import React, { useState } from "react";

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "../../../common/components/ui/avatar";
import { Badge } from "../../../common/components/ui/badge";
import { Button } from "../../../common/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "../../../common/components/ui/dialog";
import { ScrollArea } from "../../../common/components/ui/scroll-area";
import { Role } from "../../../common/types/auth";
import type { ConversationResponse, UserResponse } from "../types";

type MembersModalProps = {
    conversation: ConversationResponse;
    currentUser: UserResponse;
    isOpen: boolean;
    onClose: () => void;
    onLeaveGroup?: () => void;
};

export const MembersModal: React.FC<MembersModalProps> = ({
    conversation,
    currentUser,
    isOpen,
    onClose,
    onLeaveGroup,
}) => {
    const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

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

    const handleLeaveGroup = () => {
        if (onLeaveGroup) {
            onLeaveGroup();
        }
        setShowLeaveConfirm(false);
        onClose();
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Group Members
                        </DialogTitle>
                    </DialogHeader>

                    <ScrollArea className="max-h-96">
                        <div className="space-y-2">
                            {conversation.participants.map((participant) => (
                                <div
                                    key={participant.id}
                                    className="hover:bg-muted/50 flex items-center gap-3 rounded-lg p-2"
                                >
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage
                                            src={participant.avatarUrl}
                                        />
                                        <AvatarFallback>
                                            {participant.fullName
                                                .charAt(0)
                                                .toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="max-w-[150px] truncate font-medium">
                                                {participant.fullName}
                                                {participant.id ===
                                                    currentUser.id && (
                                                    <span className="text-muted-foreground ml-1 text-sm">
                                                        (You)
                                                    </span>
                                                )}
                                            </p>
                                            {participant.role ===
                                                Role.Admin && (
                                                <Crown className="h-4 w-4 text-yellow-500" />
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge
                                                variant={getRoleBadgeVariant(
                                                    participant.role,
                                                )}
                                                className="text-xs"
                                            >
                                                {getRoleDisplayText(
                                                    participant.role,
                                                )}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>

                    {conversation.isGroup && (
                        <div className="border-t pt-4">
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setShowLeaveConfirm(true)}
                                className="w-full"
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                Leave Group
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Leave Group Confirmation Dialog */}
            <Dialog open={showLeaveConfirm} onOpenChange={setShowLeaveConfirm}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <LogOut className="text-destructive h-5 w-5" />
                            Confirm leave group
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <p className="text-muted-foreground text-sm">
                            Are you sure you want to leave the group{" "}
                            <span className="font-medium">
                                {conversation.conversationName || "this"}
                            </span>
                            ? You will not be able to view messages or join the
                            conversation again.
                        </p>

                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowLeaveConfirm(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={handleLeaveGroup}
                            >
                                Leave Group
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};
