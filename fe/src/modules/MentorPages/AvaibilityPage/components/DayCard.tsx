import { format, isToday } from "date-fns";
import { Plus } from "lucide-react";

import { Button } from "@/common/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/common/components/ui/card";
import { Dialog, DialogTrigger } from "@/common/components/ui/dialog";

import { TimeSlotCard } from "./TimeSlotCard";

import { type TimeSlotResponse, TimeSlotStatus } from "../types";

type DayCardProps = {
    day: Date;
    dayAvailability: (TimeSlotResponse & { date: string })[];
    isDayInPast: (date: Date) => boolean;
    isTimeSlotInPast: (date: Date, timeString: string) => boolean;
    isAddModalOpen: boolean;
    onAddModalChange: (open: boolean, day?: Date) => void;
    onEditSlot: (slot: TimeSlotResponse & { date: string }) => void;
    onDeleteSlot: (slot: TimeSlotResponse & { date: string }) => void;
};

export const DayCard = ({
    day,
    dayAvailability,
    isDayInPast,
    isTimeSlotInPast,
    isAddModalOpen,
    onAddModalChange,
    onEditSlot,
    onDeleteSlot,
}: DayCardProps) => {
    const isDayToday = isToday(day);
    const isPast = isDayInPast(day);

    return (
        <Card
            className={`transition-all duration-200 hover:shadow-md ${
                isDayToday
                    ? "border-primary dark:border-primary dark:bg-primary/5 shadow-sm"
                    : isPast
                      ? "dark:bg-muted/30 opacity-70"
                      : "hover:border-primary/50 dark:hover:border-primary/50"
            } `}
        >
            <CardHeader className="px-3 pt-3 pb-2">
                <CardTitle className="text-center">
                    <div
                        className={`mx-auto mb-1 flex h-8 w-8 flex-col items-center justify-center rounded-full ${
                            isDayToday
                                ? "bg-primary text-primary-foreground"
                                : "text-foreground dark:text-foreground"
                        } `}
                    >
                        <span className="text-sm font-semibold">
                            {format(day, "d")}
                        </span>
                    </div>
                    <div
                        className={`text-xs tracking-wide uppercase ${
                            isDayToday
                                ? "text-primary font-medium"
                                : "text-muted-foreground"
                        } `}
                    >
                        {format(day, "EEE")}
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 p-2">
                {dayAvailability.length > 0 ? (
                    <div className="space-y-2">
                        {dayAvailability.map((slot) => {
                            const isSlotInPast = isTimeSlotInPast(
                                day,
                                slot.startTime,
                            );
                            const canEdit =
                                !isSlotInPast &&
                                slot.status === TimeSlotStatus.Available;

                            return (
                                <TimeSlotCard
                                    key={slot.id}
                                    slot={slot}
                                    isInPast={isSlotInPast}
                                    onEdit={
                                        canEdit
                                            ? () => onEditSlot(slot)
                                            : () => {}
                                    }
                                    onDelete={
                                        canEdit
                                            ? () => onDeleteSlot(slot)
                                            : () => {}
                                    }
                                />
                            );
                        })}
                        {!isPast && (
                            <div className="flex justify-center">
                                <Dialog
                                    open={isAddModalOpen}
                                    onOpenChange={(open) =>
                                        onAddModalChange(open)
                                    }
                                >
                                    <DialogTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 justify-center border-dashed"
                                            onClick={() =>
                                                onAddModalChange(true, day)
                                            }
                                        >
                                            <Plus className="mr-1 h-3 w-3" />
                                            Add Time Slot
                                        </Button>
                                    </DialogTrigger>
                                </Dialog>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-muted-foreground flex h-32 flex-col items-center justify-center text-center">
                        <div className="mb-2 text-sm">
                            No time slots available
                        </div>
                        {!isPast && (
                            <Dialog
                                open={isAddModalOpen}
                                onOpenChange={(open) => onAddModalChange(open)}
                            >
                                <DialogTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 flex justify-center border-dashed"
                                        onClick={() =>
                                            onAddModalChange(true, day)
                                        }
                                    >
                                        <Plus className="mr-1 h-3 w-3" />
                                        Add Time Slot
                                    </Button>
                                </DialogTrigger>
                            </Dialog>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
