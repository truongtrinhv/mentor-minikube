import { addDays, startOfWeek } from "date-fns";
import { useMemo, useState } from "react";

import LoadingSpinner from "@/common/components/loading-spinner";
import { TooltipProvider } from "@/common/components/ui/tooltip";

import { AddAvailabilityModal } from "./AddAvailabilityModal";
import { DayCard } from "./DayCard";
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog";
import { EditAvailabilityModal } from "./EditAvailabilityModal";
import { StatusLegend } from "./StatusLegend";
import { WeekNavigation } from "./WeekNavigation";

import useAvailability from "../hooks/useAvailability";
import useWeekAvailability from "../hooks/useWeekAvailability";
import type { EditScheduleRequest, TimeSlotResponse } from "../types";
import {
    convertUtcToLocalTime,
    isDateTimeInFuture,
} from "../utils/dateTimeUtils";

export const AvailabilityPage = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingSlot, setEditingSlot] = useState<
        (TimeSlotResponse & { date: string }) | null
    >(null);
    const [deletingSlot, setDeletingSlot] = useState<
        (TimeSlotResponse & { date: string }) | null
    >(null);
    const [selectedDay, setSelectedDay] = useState<Date | null>(null);
    const [editFormData, setEditFormData] = useState<EditScheduleRequest>({
        timeBlock: { startTime: "09:00", endTime: "10:00" },
    });

    const {
        updateSchedule,
        deleteSchedule,
        isUpdatingSchedule,
        isDeletingSchedule,
    } = useAvailability();

    const weekDays = useMemo(() => {
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
        return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    }, [currentDate]);

    const weekStart = weekDays[0];
    const weekEnd = weekDays[6];

    const { getDayAvailability, isLoading: isLoadingWeekData } =
        useWeekAvailability({
            weekStart,
            weekEnd,
        });

    const isDayInPast = (date: Date): boolean => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today;
    };

    const isTimeSlotInPast = (date: Date, utcTimeString: string): boolean => {
        try {
            if (utcTimeString.includes("T") || utcTimeString.includes("Z")) {
                const slotTime = new Date(utcTimeString);
                const now = new Date();
                return slotTime < now;
            }

            const localTimeString = convertUtcToLocalTime(utcTimeString, date);
            return !isDateTimeInFuture(date, localTimeString);
        } catch (error) {
            console.error("Error checking if time slot is in past:", error);
            return false;
        }
    };

    const handlePreviousWeek = () => {
        setCurrentDate((prev) => addDays(prev, -7));
    };

    const handleNextWeek = () => {
        setCurrentDate((prev) => addDays(prev, 7));
    };

    const handleToday = () => {
        setCurrentDate(new Date());
    };

    const handleDateSelect = (selectedDate: Date) => {
        setCurrentDate(selectedDate);
    };

    const handleAddModalChange = (open: boolean, day?: Date) => {
        if (open && day) {
            setSelectedDay(day);
        } else if (!open) {
            setSelectedDay(null);
        }
        setIsAddModalOpen(open);
    };

    const handleEditSlot = (slot: TimeSlotResponse & { date: string }) => {
        setEditingSlot(slot);

        const slotDate = new Date(slot.date);
        const localStartTime = slot.startTime.includes("T")
            ? new Date(slot.startTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
              })
            : convertUtcToLocalTime(slot.startTime, slotDate);

        const localEndTime = slot.endTime.includes("T")
            ? new Date(slot.endTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
              })
            : convertUtcToLocalTime(slot.endTime, slotDate);

        setEditFormData({
            timeBlock: {
                startTime: localStartTime,
                endTime: localEndTime,
            },
        });
        setIsEditModalOpen(true);
    };

    const handleDeleteSlot = (slot: TimeSlotResponse & { date: string }) => {
        setDeletingSlot(slot);
        setIsDeleteDialogOpen(true);
    };

    const handleEditSubmit = (data: EditScheduleRequest) => {
        if (!editingSlot) return;

        updateSchedule({
            id: editingSlot.id,
            data: data,
        });

        setIsEditModalOpen(false);
        setEditingSlot(null);
    };

    const handleDeleteConfirm = () => {
        if (!deletingSlot) return;

        deleteSchedule(deletingSlot.id);
        setIsDeleteDialogOpen(false);
        setDeletingSlot(null);
    };

    const getLocalTimeDayAvailability = (day: Date) => {
        const availabilityData = getDayAvailability(day);

        return availabilityData;
    };

    return (
        <TooltipProvider>
            <div className="container mx-auto p-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold">
                        Availability Management
                    </h1>
                    <p className="text-muted-foreground">
                        Manage your available time slots for mentoring sessions
                    </p>
                </div>

                {/* Week Navigation */}
                <WeekNavigation
                    currentDate={currentDate}
                    weekStart={weekStart}
                    weekEnd={weekEnd}
                    onPreviousWeek={handlePreviousWeek}
                    onNextWeek={handleNextWeek}
                    onToday={handleToday}
                    onDateSelect={handleDateSelect}
                    isAddModalOpen={isAddModalOpen}
                    onAddModalChange={handleAddModalChange}
                />

                {/* Week Grid */}
                {isLoadingWeekData ? (
                    <div className="flex min-h-[400px] items-center justify-center">
                        <LoadingSpinner size="lg" />
                        <span className="ml-2">
                            Loading availability data...
                        </span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-7">
                        {weekDays.map((day) => {
                            const dayAvailability =
                                getLocalTimeDayAvailability(day);

                            const timeSlotsWithDate = dayAvailability.map(
                                (slot) => ({
                                    ...slot,
                                    date: day.toISOString(),
                                }),
                            );

                            return (
                                <DayCard
                                    key={day.toString()}
                                    day={day}
                                    dayAvailability={timeSlotsWithDate}
                                    isDayInPast={isDayInPast}
                                    isTimeSlotInPast={isTimeSlotInPast}
                                    isAddModalOpen={isAddModalOpen}
                                    onAddModalChange={handleAddModalChange}
                                    onEditSlot={handleEditSlot}
                                    onDeleteSlot={handleDeleteSlot}
                                />
                            );
                        })}
                    </div>
                )}

                {/* Status Legend */}
                <StatusLegend />

                {/* Add Availability Modal */}
                <AddAvailabilityModal
                    isOpen={isAddModalOpen}
                    onOpenChange={handleAddModalChange}
                    weekDays={weekDays}
                    isDayInPast={isDayInPast}
                    selectedDay={selectedDay}
                />

                {/* Edit Availability Modal */}
                <EditAvailabilityModal
                    isOpen={isEditModalOpen}
                    onOpenChange={setIsEditModalOpen}
                    formData={editFormData}
                    onFormDataChange={(data) =>
                        setEditFormData((prev) => ({ ...prev, ...data }))
                    }
                    isLoading={isUpdatingSchedule}
                    onSubmit={handleEditSubmit}
                    slotDate={
                        editingSlot?.date
                            ? new Date(editingSlot.date)
                            : undefined
                    }
                />

                {/* Delete Confirmation Dialog */}
                <DeleteConfirmationDialog
                    isOpen={isDeleteDialogOpen}
                    onOpenChange={setIsDeleteDialogOpen}
                    deletingSlot={deletingSlot}
                    isLoading={isDeletingSchedule}
                    onConfirm={handleDeleteConfirm}
                />
            </div>
        </TooltipProvider>
    );
};
