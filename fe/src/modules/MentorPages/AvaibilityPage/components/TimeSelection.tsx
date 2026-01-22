import { Label } from "@/common/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/common/components/ui/select";

import type { TimeBlockRequest } from "../types";

type TimeSelectionProps = {
    timeRange: TimeBlockRequest;
    onTimeRangeChange: (timeRange: TimeBlockRequest) => void;
    startTimeLabel?: string;
    endTimeLabel?: string;
    selectedDates?: Date[];
};

export const TimeSelection = ({
    timeRange,
    onTimeRangeChange,
    startTimeLabel = "Start time",
    endTimeLabel = "End time",
    selectedDates = [],
}: TimeSelectionProps) => {
    const calculateDuration = (start: string, end: string): number => {
        const [startHours, startMinutes] = start.split(":").map(Number);
        const [originalEndHours, endMinutes] = end.split(":").map(Number);

        const endHours =
            originalEndHours < startHours
                ? originalEndHours + 24
                : originalEndHours;

        return (endHours - startHours) * 60 + (endMinutes - startMinutes);
    };

    const hasToday = selectedDates.some((date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    });

    const getCurrentTimeWithBuffer = (): string => {
        const now = new Date();
        now.setMinutes(now.getMinutes() + 15);
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const bufferTime = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;

        return bufferTime;
    };

    const isTimeInPast = (time: string): boolean => {
        if (!hasToday) return false;

        const bufferTime = getCurrentTimeWithBuffer();
        return time < bufferTime;
    };

    const generateTimeOptions = (isEndTime = false): string[] => {
        const times: string[] = [];
        const totalSlots = 24 * 4;
        for (let i = 0; i < totalSlots; i++) {
            const hours = Math.floor((i * 15) / 60) % 24;
            const minutes = (i * 15) % 60;
            const time = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;

            if (isEndTime) {
                if (timeRange.startTime) {
                    const duration = calculateDuration(
                        timeRange.startTime,
                        time,
                    );
                    if (duration < 30) continue;
                }
                if (time <= timeRange.startTime) continue;
            }

            if (hasToday && isTimeInPast(time)) continue;

            times.push(time);
        }

        return times;
    };

    const startTimeOptions = generateTimeOptions(false);
    const endTimeOptions = generateTimeOptions(true);

    const addMinutes = (time: string, minutes: number): string => {
        const [hours, mins] = time.split(":").map(Number);
        const totalMinutes = hours * 60 + mins + minutes;
        const newHours = Math.floor(totalMinutes / 60) % 24;
        const newMins = totalMinutes % 60;
        return `${newHours.toString().padStart(2, "0")}:${newMins.toString().padStart(2, "0")}`;
    };

    const handleStartTimeChange = (value: string) => {
        const newTimeRange = { ...timeRange, startTime: value };

        if (
            !timeRange.endTime ||
            calculateDuration(value, timeRange.endTime) < 30
        ) {
            const minEndTime = addMinutes(value, 30);
            newTimeRange.endTime = minEndTime;
        }

        onTimeRangeChange(newTimeRange);
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="start-time" className="mb-2">
                        {startTimeLabel}
                    </Label>
                    <Select
                        value={timeRange.startTime}
                        onValueChange={handleStartTimeChange}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select start time" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px] overflow-y-auto">
                            {startTimeOptions.map((time) => (
                                <SelectItem key={time} value={time}>
                                    {time}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="end-time" className="mb-2">
                        {endTimeLabel}
                    </Label>
                    <Select
                        value={timeRange.endTime}
                        onValueChange={(value) =>
                            onTimeRangeChange({
                                ...timeRange,
                                endTime: value,
                            })
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select end time" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px] overflow-y-auto">
                            {endTimeOptions.length > 0 ? (
                                endTimeOptions.map((time) => (
                                    <SelectItem key={time} value={time}>
                                        {time}
                                    </SelectItem>
                                ))
                            ) : (
                                <div className="text-muted-foreground p-2 text-center">
                                    No valid end time available
                                </div>
                            )}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div className="text-muted-foreground text-sm">
                    Duration:{" "}
                    {timeRange.startTime && timeRange.endTime
                        ? calculateDuration(
                              timeRange.startTime,
                              timeRange.endTime,
                          )
                        : 0}{" "}
                    minutes
                </div>
                <div className="text-muted-foreground text-sm">
                    Timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}
                </div>
            </div>
        </div>
    );
};
