import { format } from "date-fns";
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
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { Switch } from "@/common/components/ui/switch";

import { DaySelection } from "./DaySelection";
import { TimeSelection } from "./TimeSelection";

import useAvailability from "../hooks/useAvailability";
import type { TimeBlockRequest } from "../types";
import {
    createScheduleRequest,
    validateScheduleRequest,
} from "../utils/dateTimeUtils";

type AddAvailabilityFormData = {
    selectedDays: Date[];
    timeRange: TimeBlockRequest;
    repeatEnabled: boolean;
    repeatWeeks: number;
};

type AddAvailabilityModalProps = {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    weekDays: Date[];
    isDayInPast: (date: Date) => boolean;
    selectedDay?: Date | null;
};

export const AddAvailabilityModal = ({
    isOpen,
    onOpenChange,
    weekDays,
    isDayInPast,
    selectedDay,
}: AddAvailabilityModalProps) => {
    const { createSchedule, isCreatingSchedule } = useAvailability();
    const [validationError, setValidationError] = useState<string | null>(null);

    const [formData, setFormData] = useState<AddAvailabilityFormData>({
        selectedDays: [],
        timeRange: { startTime: "00:00", endTime: "01:00" },
        repeatEnabled: false,
        repeatWeeks: 1,
    });

    useEffect(() => {
        if (isOpen && selectedDay && !isDayInPast(selectedDay)) {
            setFormData((prev) => ({
                ...prev,
                selectedDays: [selectedDay],
            }));
        } else if (!isOpen) {
            setFormData((prev) => ({
                ...prev,
                selectedDays: [],
            }));
        }
    }, [isOpen, selectedDay, isDayInPast]);

    const handleFormDataChange = (data: Partial<AddAvailabilityFormData>) => {
        setFormData((prev) => ({ ...prev, ...data }));
        setValidationError(null);
    };

    const handleDaySelect = (day: Date) => {
        if (isDayInPast(day)) return;

        const newSelectedDays = formData.selectedDays.some(
            (d) => d.toDateString() === day.toDateString(),
        )
            ? formData.selectedDays.filter(
                  (d) => d.toDateString() !== day.toDateString(),
              )
            : [...formData.selectedDays, day];

        handleFormDataChange({ selectedDays: newSelectedDays });
    };

    const handleSelectWeekdays = () => {
        handleFormDataChange({
            selectedDays: weekDays
                .slice(0, 5)
                .filter((day) => !isDayInPast(day)),
        });
    };

    const handleSelectWeekends = () => {
        handleFormDataChange({
            selectedDays: weekDays.slice(5).filter((day) => !isDayInPast(day)),
        });
    };

    const handleSelectEntireWeek = () => {
        handleFormDataChange({
            selectedDays: weekDays.filter((day) => !isDayInPast(day)),
        });
    };

    const handleSubmit = () => {
        const validationResult = validateScheduleRequest(
            formData.selectedDays,
            formData.timeRange.startTime,
            formData.timeRange.endTime,
        );

        if (validationResult) {
            setValidationError(validationResult);
            return;
        }

        try {
            const request = createScheduleRequest(
                formData.selectedDays,
                formData.timeRange.startTime,
                formData.timeRange.endTime,
                formData.repeatEnabled,
                formData.repeatEnabled ? formData.repeatWeeks : 0,
            );

            createSchedule(request);

            setFormData({
                selectedDays: [],
                timeRange: { startTime: "00:00", endTime: "01:00" },
                repeatEnabled: false,
                repeatWeeks: 1,
            });
            onOpenChange(false);
        } catch (error) {
            console.error("Error creating schedule request:", error);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>
                        Add Availability{" "}
                        {weekDays.length > 0 &&
                            `- ${format(weekDays[0], "MMMM yyyy")}`}
                    </DialogTitle>
                    <DialogDescription>
                        Set your available time slots for mentoring sessions.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {/* Error message */}
                    {validationError && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                {validationError}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Day Selection */}
                    <DaySelection
                        weekDays={weekDays}
                        selectedDays={formData.selectedDays}
                        onDaySelect={handleDaySelect}
                        onSelectWeekdays={handleSelectWeekdays}
                        onSelectWeekends={handleSelectWeekends}
                        onSelectEntireWeek={handleSelectEntireWeek}
                        isDayInPast={isDayInPast}
                    />

                    {/* Time Selection */}
                    <TimeSelection
                        timeRange={formData.timeRange}
                        onTimeRangeChange={(timeRange) =>
                            handleFormDataChange({ timeRange })
                        }
                        selectedDates={formData.selectedDays}
                    />

                    {/* Repeat Options */}
                    <div>
                        <div className="mb-2 flex items-center space-x-2">
                            <Switch
                                id="repeat-toggle"
                                checked={formData.repeatEnabled}
                                onCheckedChange={(repeatEnabled) =>
                                    handleFormDataChange({ repeatEnabled })
                                }
                            />
                            <Label htmlFor="repeat-toggle">
                                Repeat this schedule
                            </Label>
                        </div>
                        {formData.repeatEnabled && (
                            <div className="space-y-4 pl-8">
                                <div className="flex items-center space-x-4">
                                    <Label
                                        htmlFor="repeat-weeks"
                                        className="whitespace-nowrap"
                                    >
                                        Number of weeks:
                                    </Label>
                                    <Input
                                        id="repeat-weeks"
                                        type="number"
                                        min="1"
                                        max="52"
                                        value={formData.repeatWeeks}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (
                                                value === "" ||
                                                (Number(value) >= 1 &&
                                                    Number(value) <= 52)
                                            ) {
                                                handleFormDataChange({
                                                    repeatWeeks:
                                                        value === ""
                                                            ? 1
                                                            : Number(value),
                                                });
                                            }
                                        }}
                                        onInput={(e) => {
                                            e.currentTarget.value =
                                                e.currentTarget.value.replace(
                                                    /[^0-9]/g,
                                                    "",
                                                );
                                        }}
                                        className="w-20"
                                    />
                                </div>
                                <div className="text-muted-foreground text-sm">
                                    This will create recurring sessions for{" "}
                                    {formData.repeatWeeks} week
                                    {formData.repeatWeeks !== 1 ? "s" : ""}.
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isCreatingSchedule}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={
                            isCreatingSchedule ||
                            formData.selectedDays.length === 0
                        }
                    >
                        {isCreatingSchedule ? (
                            <>
                                <Loader2 className="mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            "Save"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
