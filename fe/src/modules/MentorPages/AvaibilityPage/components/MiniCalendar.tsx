import { format, isSameDay } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

type MiniCalendarProps = {
    currentDate: Date;
    onDateSelect: (date: Date) => void;
    onClose: () => void;
};

export const MiniCalendar = ({
    currentDate,
    onDateSelect,
    onClose,
}: MiniCalendarProps) => {
    const today = new Date();
    const [viewDate, setViewDate] = useState(currentDate);

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const handleDateClick = (day: number) => {
        const selectedDate = new Date(year, month, day);
        onDateSelect(selectedDate);
        onClose();
    };

    const navigateMonth = (direction: "prev" | "next") => {
        const newDate = new Date(viewDate);
        if (direction === "prev") {
            newDate.setMonth(month - 1);
        } else {
            newDate.setMonth(month + 1);
        }
        setViewDate(newDate);
    };

    const days = [];

    for (let i = 0; i < firstDayOfWeek; i++) {
        days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const cellDate = new Date(year, month, day);
        const isToday = isSameDay(cellDate, today);
        const isSelected = isSameDay(cellDate, currentDate);
        const isPast = cellDate < today;

        days.push(
            <button
                key={day}
                onClick={() => handleDateClick(day)}
                disabled={isPast}
                className={`h-8 w-8 rounded text-sm transition-colors ${
                    isPast
                        ? "cursor-not-allowed text-gray-300 dark:text-gray-600"
                        : "hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-900/30 dark:hover:text-blue-400"
                } ${
                    isToday && !isSelected
                        ? "bg-blue-100 font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        : ""
                } ${
                    isSelected
                        ? "bg-blue-600 font-medium text-white dark:bg-blue-600"
                        : ""
                }`}
            >
                {day}
            </button>,
        );
    }

    return (
        <div className="p-3">
            <div className="mb-3 flex items-center justify-between">
                <button
                    onClick={() => navigateMonth("prev")}
                    className="rounded p-1 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {format(viewDate, "MMMM yyyy")}
                </span>
                <button
                    onClick={() => navigateMonth("next")}
                    className="rounded p-1 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>

            <div className="mb-2 grid grid-cols-7 gap-1">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                    <div
                        key={day}
                        className="flex h-8 w-8 items-center justify-center text-xs font-medium text-gray-500 dark:text-gray-400"
                    >
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">{days}</div>
        </div>
    );
};
