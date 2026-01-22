import { UserCheck, UserX } from "lucide-react";
import { useState } from "react";

import { Button } from "@/common/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/common/components/ui/dialog";
import { cn } from "@/common/lib/utils";

import { useActivateDeactivate } from "../hooks/useActivateDeactivate";
import type { User } from "../types";

export const ActionCell = ({ user }: { user: User }) => {
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const { activate, deactivate, isPending } = useActivateDeactivate(user.id);

    const isActive = user.status === 0;
    const isDeactivated = user.status === 1;

    const handleOpenDialog = () => {
        setIsConfirmOpen(true);
    };

    const handleCloseDialog = () => {
        setIsConfirmOpen(false);
    };

    const confirmAction = async () => {
        if (isActive) {
            await deactivate();
        }

        if (isDeactivated) {
            await activate();
        }

        setIsConfirmOpen(false);
    };

    return (
        <>
            <div className="flex space-x-2">
                {isActive && (
                    <Button
                        size="icon"
                        onClick={handleOpenDialog}
                        className="rounded bg-red-50 p-1.5 text-red-600 hover:bg-red-100 dark:bg-red-800 dark:text-red-100 dark:hover:bg-red-700"
                        title="Deactivate user"
                    >
                        <UserX />
                    </Button>
                )}

                {isDeactivated && (
                    <Button
                        size="icon"
                        onClick={handleOpenDialog}
                        className="rounded bg-green-50 p-1.5 text-green-600 hover:bg-green-100 dark:bg-green-800 dark:text-green-100 dark:hover:bg-green-700"
                        title="Activate user"
                    >
                        <UserCheck />
                    </Button>
                )}
            </div>

            <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {isActive && "Deactivate Account"}
                            {isDeactivated && "Activate Account"}
                        </DialogTitle>
                        <DialogDescription>
                            {isActive &&
                                `Are you sure you want to deactivate ${user.userDetail.fullName}'s account?`}
                            {isDeactivated &&
                                `Are you sure you want to activate ${user.userDetail.fullName}'s account?`}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={handleCloseDialog}>
                            Cancel
                        </Button>
                        <Button
                            variant={isActive ? "destructive" : "default"}
                            onClick={confirmAction}
                            className={cn(isActive && "text-white")}
                            disabled={isPending}
                        >
                            {isDeactivated ? "Activate" : "Deactivate"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};
