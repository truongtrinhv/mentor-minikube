import { AlertCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Alert, AlertDescription } from "@/common/components/ui/alert";
import { Button } from "@/common/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/common/components/ui/dialog";

import { TimeSelection } from "./TimeSelection";

import type { EditScheduleRequest } from "../types";
import {
    createEditScheduleRequest,
    validateScheduleRequest,
} from "../utils/dateTimeUtils";

type EditScheduleRequestProps = {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    formData: EditScheduleRequest;
    onFormDataChange: (data: Partial<EditScheduleRequest>) => void;
    isLoading: boolean;
    onSubmit: (data: EditScheduleRequest) => void;
    slotDate?: Date;
};

export const EditAvailabilityModal = ({
    isOpen,
    onOpenChange,
    formData,
    onFormDataChange,
    isLoading,
    onSubmit,
    slotDate,
}: EditScheduleRequestProps) => {
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!slotDate) return;

        const validationError = validateScheduleRequest(
            [slotDate],
            formData.timeBlock.startTime,
            formData.timeBlock.endTime,
        );

        setError(validationError);
    }, [formData.timeBlock, slotDate]);

    const handleSubmit = () => {
        if (error || !slotDate) return;

        const request = createEditScheduleRequest(
            slotDate,
            formData.timeBlock.startTime,
            formData.timeBlock.endTime,
        );

        onSubmit(request);
    };

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (isLoading) return;
                onOpenChange(open);
            }}
        >
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Edit Availability</DialogTitle>
                    <DialogDescription>
                        Update your available time slots for mentoring sessions.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {/* Error message */}
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Time Selection */}
                    <TimeSelection
                        timeRange={formData.timeBlock}
                        onTimeRangeChange={(timeBlock) =>
                            onFormDataChange({ timeBlock })
                        }
                        startTimeLabel="Start time"
                        endTimeLabel="End time"
                        selectedDates={slotDate ? [slotDate] : []}
                    />
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isLoading || !!error}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 animate-spin" />
                                Updating...
                            </>
                        ) : (
                            "Update"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
