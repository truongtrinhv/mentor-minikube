import { Loader2 } from "lucide-react";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/common/components/ui/alert-dialog";

import { type TimeSlotResponse, TimeSlotStatus } from "../types";
import { formatSessionTimeRange } from "../utils/dateTimeUtils";

type DeleteConfirmationDialogProps = {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    deletingSlot: (TimeSlotResponse & { date: string }) | null;
    isLoading: boolean;
    onConfirm: () => void;
};

export const DeleteConfirmationDialog = ({
    isOpen,
    onOpenChange,
    deletingSlot,
    isLoading,
    onConfirm,
}: DeleteConfirmationDialogProps) => {
    return (
        <AlertDialog
            open={isOpen}
            onOpenChange={(open) => {
                if (isLoading) return;
                onOpenChange(open);
            }}
        >
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete your availability slot
                        {deletingSlot ? (
                            <span className="font-medium">
                                {" "}
                                {formatSessionTimeRange(
                                    deletingSlot.startTime,
                                    deletingSlot.endTime,
                                )}
                            </span>
                        ) : (
                            ""
                        )}
                        .
                        {deletingSlot?.status === TimeSlotStatus.Available && (
                            <span className="mt-2 block text-gray-600">
                                This available time slot will be removed from
                                your schedule.
                            </span>
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            "Delete"
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
