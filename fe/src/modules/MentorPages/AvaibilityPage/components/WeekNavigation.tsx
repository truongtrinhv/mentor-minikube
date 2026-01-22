import { format, isSameDay } from "date-fns";
import { Calendar, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/common/components/ui/button";
import { Card, CardHeader } from "@/common/components/ui/card";
import { Dialog, DialogTrigger } from "@/common/components/ui/dialog";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/common/components/ui/popover";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/common/components/ui/tooltip";

import { MiniCalendar } from "./MiniCalendar";

type WeekNavigationProps = {
    currentDate: Date;
    weekStart: Date;
    weekEnd: Date;
    onPreviousWeek: () => void;
    onNextWeek: () => void;
    onToday: () => void;
    onDateSelect: (date: Date) => void;
    isAddModalOpen: boolean;
    onAddModalChange: (open: boolean) => void;
};

export const WeekNavigation = ({
    currentDate,
    weekStart,
    weekEnd,
    onPreviousWeek,
    onNextWeek,
    onToday,
    onDateSelect,
    isAddModalOpen,
    onAddModalChange,
}: WeekNavigationProps) => {
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    return (
        <Card className="mb-6">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={onPreviousWeek}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Previous Week</TooltipContent>
                        </Tooltip>

                        <span className="font-medium">
                            {format(weekStart, "MMM d")} -{" "}
                            {format(weekEnd, "MMM d, yyyy")}
                        </span>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={onNextWeek}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Next Week</TooltipContent>
                        </Tooltip>

                        {/* Calendar Picker */}
                        <Popover
                            open={isCalendarOpen}
                            onOpenChange={setIsCalendarOpen}
                        >
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" size="icon">
                                            <Calendar className="h-4 w-4" />
                                        </Button>
                                    </PopoverTrigger>
                                </TooltipTrigger>
                            </Tooltip>
                            <PopoverContent
                                className="z-50 w-auto p-0"
                                align="start"
                            >
                                <MiniCalendar
                                    currentDate={currentDate}
                                    onDateSelect={onDateSelect}
                                    onClose={() => setIsCalendarOpen(false)}
                                />
                            </PopoverContent>
                        </Popover>

                        <Button
                            variant={
                                isSameDay(currentDate, new Date())
                                    ? "default"
                                    : "outline"
                            }
                            onClick={onToday}
                            className="ml-4"
                        >
                            Today
                        </Button>
                    </div>

                    <div className="flex space-x-2">
                        <Dialog
                            open={isAddModalOpen}
                            onOpenChange={(open) => onAddModalChange(open)}
                        >
                            <DialogTrigger asChild>
                                <Button variant="default" size="default">
                                    <Plus className="mr-1 h-3 w-3" />
                                    Add Time Slot
                                </Button>
                            </DialogTrigger>
                        </Dialog>
                    </div>
                </div>
            </CardHeader>
        </Card>
    );
};
