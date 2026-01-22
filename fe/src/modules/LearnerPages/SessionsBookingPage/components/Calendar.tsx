import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/common/components/ui/button";
import { Card, CardContent } from "@/common/components/ui/card";

import type { AvailableSlots } from "../types";

type CalendarProps = {
    selectedDate: Date;
    onDateSelect: (date: Date) => void;
    availableSlots: AvailableSlots;
};

export const Calendar = ({
    selectedDate,
    onDateSelect,
    availableSlots,
}: CalendarProps) => {
    const currentMonth = selectedDate.getMonth();
    const currentYear = selectedDate.getFullYear();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const getDaysInMonth = (month: number, year: number): number =>
        new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (month: number, year: number): number =>
        new Date(year, month, 1).getDay();

    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);

    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];

    const hasAvailableSlots = (date: Date): boolean => {
        const dateStr = date.toDateString();
        return (
            !!availableSlots[dateStr] &&
            availableSlots[dateStr].some((slot) => slot.available)
        );
    };

    const navigateMonth = (direction: "prev" | "next") => {
        const newDate = new Date(selectedDate);
        if (direction === "prev") {
            // Allow going back to previous months (but not before current month for bookings)
            const today = new Date();
            const todayMonth = new Date(
                today.getFullYear(),
                today.getMonth(),
                1,
            );
            const prevMonth = new Date(currentYear, currentMonth - 1, 1);

            if (prevMonth >= todayMonth) {
                newDate.setMonth(currentMonth - 1);
            }
        } else {
            newDate.setMonth(currentMonth + 1);
        }
        onDateSelect(newDate);
    };

    const selectDate = (day: number) => {
        const newDate = new Date(currentYear, currentMonth, day);
        onDateSelect(newDate);
    };

    const isSameDate = (date1: Date, date2: Date): boolean => {
        return (
            date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate()
        );
    };

    const emptyDays = Array(firstDay).fill(null);

    return (
        <Card className="shadow-md transition-colors dark:border-gray-800 dark:shadow-gray-900/20">
            <CardContent className="p-6 transition-colors">
                {/* Calendar Header */}
                <div className="mb-6 flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigateMonth("prev")}
                        className="transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <h3 className="text-xl font-bold text-gray-800 transition-colors dark:text-gray-100">
                        {months[currentMonth]} {currentYear}
                    </h3>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigateMonth("next")}
                        className="transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2">
                    {/* Day Headers */}
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                        (day) => (
                            <div
                                key={day}
                                className="py-2 text-center text-sm font-semibold text-gray-600 transition-colors dark:text-gray-400"
                            >
                                {day}
                            </div>
                        ),
                    )}

                    {/* Empty Days */}
                    {emptyDays.map((_, index) => (
                        <div
                            key={`empty-${index}`}
                            className="h-12 w-full"
                        ></div>
                    ))}

                    {/* Calendar Days */}
                    {Array.from({ length: daysInMonth }, (_, i) => {
                        const day = i + 1;
                        const currentDate = new Date(
                            currentYear,
                            currentMonth,
                            day,
                        );

                        currentDate.setHours(0, 0, 0, 0);

                        const isToday = isSameDate(currentDate, today);
                        const isSelected = isSameDate(
                            currentDate,
                            selectedDate,
                        );
                        const isPast = currentDate < today;
                        const hasSlots = hasAvailableSlots(currentDate);

                        return (
                            <Button
                                key={day}
                                variant={isSelected ? "default" : "ghost"}
                                size="sm"
                                onClick={() => !isPast && selectDate(day)}
                                disabled={isPast}
                                className={`h-12 w-full p-0 text-sm font-medium transition-all duration-200 ${isPast ? "cursor-not-allowed text-gray-300 dark:text-gray-600" : ""} ${isToday && !isSelected ? "bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/40" : ""} ${isSelected ? "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800" : ""} ${hasSlots && !isSelected && !isPast ? "ring-2 ring-green-400 ring-offset-1 hover:ring-green-500 dark:ring-green-600 dark:ring-offset-gray-900 dark:hover:ring-green-500" : ""} ${!hasSlots && !isSelected && !isPast && !isToday ? "hover:bg-gray-100 dark:hover:bg-gray-800" : ""} `}
                            >
                                {day}
                            </Button>
                        );
                    })}
                </div>

                {/* Legend */}
                <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-600 transition-colors dark:text-gray-400">
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded border-2 border-green-400 transition-colors dark:border-green-600"></div>
                        <span>Available slots</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded bg-blue-100 transition-colors dark:bg-blue-900/30"></div>
                        <span>Today</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded bg-blue-600 transition-colors dark:bg-blue-700"></div>
                        <span>Selected</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
