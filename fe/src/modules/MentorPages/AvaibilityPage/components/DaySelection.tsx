import { format, isSameDay, isToday } from "date-fns";

import { Button } from "@/common/components/ui/button";
import { Label } from "@/common/components/ui/label";

type DaySelectionProps = {
    weekDays: Date[];
    selectedDays: Date[];
    onDaySelect: (day: Date) => void;
    onSelectWeekdays: () => void;
    onSelectWeekends: () => void;
    onSelectEntireWeek: () => void;
    isDayInPast: (date: Date) => boolean;
};

export const DaySelection = ({
    weekDays,
    selectedDays,
    onDaySelect,
    onSelectWeekdays,
    onSelectWeekends,
    onSelectEntireWeek,
    isDayInPast,
}: DaySelectionProps) => {
    return (
        <div>
            <Label className="mb-2 block">Select days</Label>
            <div className="mb-4 grid grid-cols-7 gap-2">
                {weekDays.map((day) => {
                    const isSelected = selectedDays.some((d) =>
                        isSameDay(d, day),
                    );
                    const isPastDay = isDayInPast(day);
                    return (
                        <Button
                            key={day.toString()}
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            onClick={() => onDaySelect(day)}
                            disabled={isPastDay}
                            className={`h-auto py-2 ${
                                isToday(day) ? "border-primary" : ""
                            } ${isPastDay ? "cursor-not-allowed opacity-50" : ""}`}
                        >
                            <div className="text-center">
                                <div className="text-xs">
                                    {format(day, "EEE")}
                                </div>
                                <div className="text-sm font-bold">
                                    {format(day, "d")}
                                </div>
                            </div>
                        </Button>
                    );
                })}
            </div>
            <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={onSelectWeekdays}>
                    Weekdays only
                </Button>
                <Button variant="outline" size="sm" onClick={onSelectWeekends}>
                    Weekends only
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onSelectEntireWeek}
                >
                    Entire week
                </Button>
            </div>
        </div>
    );
};
