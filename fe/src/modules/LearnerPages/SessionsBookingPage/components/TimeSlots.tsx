import { Clock } from "lucide-react";

import { Button } from "@/common/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/common/components/ui/card";
import { getCurrentTimeZone } from "@/modules/LearnerPages/SessionsBookingPage/utils/dateTimeUtils";

import type { AvailableSlots, ProcessedTimeSlot, SelectedSlot } from "../types";

type TimeSlotsProps = {
    selectedDate: Date;
    selectedSlot: SelectedSlot | null;
    availableSlots: AvailableSlots;
    onSlotSelect: (date: Date, time: string) => void;
};

export const TimeSlots = ({
    selectedDate,
    selectedSlot,
    availableSlots,
    onSlotSelect,
}: TimeSlotsProps) => {
    const slots = availableSlots[selectedDate.toDateString()] || [];
    const hasAvailableSlots = slots.some((slot) => slot.available);

    const sortedSlots = [...slots].sort((a, b) => {
        const timeA = a.startTime.split(":").map(Number);
        const timeB = b.startTime.split(":").map(Number);

        if (timeA[0] !== timeB[0]) {
            return timeA[0] - timeB[0];
        }
        return timeA[1] - timeB[1];
    });

    return (
        <Card className="shadow-md transition-colors dark:border-gray-800 dark:shadow-gray-900/20">
            <CardHeader className="border-b pb-3 transition-colors dark:border-gray-700">
                <CardTitle className="flex items-center gap-2 text-base">
                    <Clock className="h-4 w-4 text-blue-600 transition-colors dark:text-blue-400" />
                    <span className="font-bold transition-colors dark:text-gray-100">
                        Available Time Slots -{" "}
                        {selectedDate.toLocaleDateString()}
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6 transition-colors">
                {!hasAvailableSlots ? (
                    <div className="py-8 text-center">
                        <p className="text-gray-500 transition-colors dark:text-gray-400">
                            No available time slots for this date
                        </p>
                        <p className="mt-2 text-sm text-gray-400 transition-colors dark:text-gray-500">
                            Please select a different date
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
                        {sortedSlots.map((slot: ProcessedTimeSlot, index) => {
                            const slotKey = `${selectedDate.toDateString()}-${slot.time}`;
                            const isSelected = selectedSlot?.key === slotKey;

                            return (
                                <Button
                                    key={index}
                                    variant={isSelected ? "default" : "outline"}
                                    onClick={() =>
                                        slot.available &&
                                        onSlotSelect(selectedDate, slot.time)
                                    }
                                    disabled={!slot.available}
                                    className={`flex h-auto flex-col p-4 transition-all ${isSelected ? "bg-blue-600 text-white ring-2 ring-blue-300 dark:bg-blue-700 dark:ring-blue-600" : ""} ${!slot.available ? "bg-gray-50 opacity-70 dark:bg-gray-800" : "hover:border-blue-300 hover:bg-blue-50 dark:hover:border-blue-700 dark:hover:bg-blue-900/20"} transition-colors dark:border-gray-700`}
                                >
                                    {/* Time Range Display */}
                                    <div className="flex flex-col items-center space-y-1">
                                        <span className="font-semibold">
                                            {slot.time}
                                        </span>
                                    </div>

                                    {!slot.available && (
                                        <span className="mt-1 text-xs text-gray-500 transition-colors dark:text-gray-400">
                                            Unavailable
                                        </span>
                                    )}
                                </Button>
                            );
                        })}
                    </div>
                )}

                <div className="mt-4 flex items-center gap-1 text-xs text-gray-500 transition-colors dark:text-gray-400">
                    <Clock className="h-3 w-3" />
                    Timezone: {getCurrentTimeZone()}
                </div>
            </CardContent>
        </Card>
    );
};
