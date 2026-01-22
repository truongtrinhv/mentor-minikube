"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format, isSameDay, startOfMonth, startOfToday } from "date-fns";
import {
    CalendarIcon,
    CalendarIcon as CalendarIconSmall,
    Clock,
    User,
} from "lucide-react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { Button } from "@/common/components/ui/button";
import { Calendar } from "@/common/components/ui/calendar";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/common/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/common/components/ui/form";
import { Label } from "@/common/components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/common/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/common/components/ui/select";
import { Textarea } from "@/common/components/ui/textarea";
import { useAuthContext } from "@/common/context/auth-context";

import { useTimeSlots } from "../hooks/useTimeSlots";
import { rescheduleSessionSchema } from "../schemas/reschedule-session-schema";
import type { MentoringSessionResponse } from "../types/mentoring-session-response";
import type { RescheduleSessionRequest } from "../types/update-session-request";

type RescheduleFormProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentSessionInfo: MentoringSessionResponse;
    onSubmit: (rescheduleInfo: RescheduleSessionRequest) => void;
};

export function formatTimeRange(
    start: Date | string | number,
    end: Date | string | number,
): string {
    if (isSameDay(start, end)) {
        const date = format(start, "MMMM do");
        const startTime = format(start, "HH:mm");
        const endTime = format(end, "HH:mm");
        return `${date} ${startTime} - ${endTime}`;
    } else {
        const startFormatted = `${format(start, "MMMM do HH:mm")}`;
        const endFormatted = `${format(end, "MMMM do HH:mm")}`;
        return `${startFormatted} - ${endFormatted}`;
    }
}

export default function RescheduleForm(props: RescheduleFormProps) {
    const {
        open,
        onOpenChange,
        currentSessionInfo,
        onSubmit = () => {},
    } = props;
    const { user } = useAuthContext();
    const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());
    const { timeSlots } = useTimeSlots(user?.id || "", selectedDate);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    const form = useForm<RescheduleSessionRequest>({
        resolver: zodResolver(rescheduleSessionSchema),
        defaultValues: {
            newScheduleId: "",
            notes: "",
        },
    });

    const watch = useWatch({
        control: form.control,
        name: ["newScheduleId", "notes"],
    });

    const handleConfirm = () => {
        onOpenChange(false);
    };

    const handleCancel = () => {
        onOpenChange(false);
        form.reset();
        setSelectedDate(startOfToday());
    };

    const handleDateSelect = (date: Date) => {
        setIsCalendarOpen(false);
        setSelectedDate(date);
        form.resetField("newScheduleId");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="sm:max-w-[500px]"
                onInteractOutside={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle>Confirm reschedule</DialogTitle>
                    <DialogDescription>
                        Review the current schedule and select a new date and
                        time.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form
                        id="tasks-form"
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="flex-1 space-y-5"
                    >
                        <div className="space-y-6">
                            <div className="space-y-3 rounded-lg bg-gray-50 p-4">
                                <h4 className="mb-3 text-sm font-medium text-gray-700">
                                    Current Schedule
                                </h4>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm">
                                        <User className="h-4 w-4 text-gray-500" />
                                        <span className="font-medium">
                                            Learner:
                                        </span>
                                        <span>
                                            {currentSessionInfo.learnerName}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <CalendarIconSmall className="h-4 w-4 text-gray-500" />
                                        <span className="font-medium">
                                            From:
                                        </span>
                                        <span>
                                            {format(
                                                currentSessionInfo.startTime,
                                                "PPPppp",
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Clock className="h-4 w-4 text-gray-500" />
                                        <span className="font-medium">To:</span>
                                        <span>
                                            {format(
                                                currentSessionInfo.endTime,
                                                "PPPppp",
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-sm font-medium">
                                    Select New Schedule
                                </h4>

                                <div className="space-y-2">
                                    <Label htmlFor="date-picker">
                                        Pick Date
                                    </Label>
                                    <Popover
                                        open={isCalendarOpen}
                                        onOpenChange={setIsCalendarOpen}
                                    >
                                        <PopoverTrigger asChild>
                                            <Button
                                                id="date-picker"
                                                variant="outline"
                                                className="w-full justify-start text-left font-normal"
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {format(selectedDate, "PPP")}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent
                                            className="w-auto p-0"
                                            align="start"
                                        >
                                            <Calendar
                                                mode="single"
                                                selected={selectedDate}
                                                onSelect={(_, selectedDay) => {
                                                    handleDateSelect(
                                                        selectedDay,
                                                    );
                                                }}
                                                disabled={(date) =>
                                                    date < startOfToday()
                                                }
                                                initialFocus
                                                defaultMonth={startOfMonth(
                                                    selectedDate,
                                                )}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <FormField
                                    control={form.control}
                                    name="newScheduleId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="!text-current">
                                                Available Time Slots
                                            </FormLabel>
                                            <FormControl className="w-full">
                                                <Select
                                                    disabled={
                                                        timeSlots.length == 0
                                                    }
                                                    defaultValue={field.value}
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                >
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue
                                                            placeholder={
                                                                timeSlots.length ==
                                                                0
                                                                    ? "No time slots available"
                                                                    : "Select a time slot"
                                                            }
                                                        />
                                                    </SelectTrigger>
                                                    <SelectContent className="w-full">
                                                        {timeSlots.map((x) => {
                                                            return (
                                                                <SelectItem
                                                                    key={x.id}
                                                                    value={x.id}
                                                                >
                                                                    {formatTimeRange(
                                                                        x.startTime,
                                                                        x.endTime,
                                                                    )}
                                                                </SelectItem>
                                                            );
                                                        })}
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="notes"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1">
                                            <FormLabel className="!text-current">
                                                Notes
                                            </FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    maxLength={200}
                                                    {...field}
                                                    className="max-h-[10rem] resize-none"
                                                    placeholder="Add notes about the reschedule..."
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                        <DialogFooter className="gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCancel}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                onClick={handleConfirm}
                                disabled={!watch[0] || !watch[1]}
                            >
                                Confirm
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
