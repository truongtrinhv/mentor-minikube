import { AlertCircle } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import LoadingSpinner from "@/common/components/loading-spinner";
import { Alert, AlertDescription } from "@/common/components/ui/alert";
import { Button } from "@/common/components/ui/button";
import { CourseLevelMap } from "@/common/types/course";
import { processSchedulesToSlots } from "@/modules/LearnerPages/SessionsBookingPage/utils/dateTimeUtils";

import {
    BookingConfirmation,
    Calendar,
    CourseDetailCard,
    MentorCard,
    SessionTypeSelector,
    TimeSlots,
} from "./components";
import {
    useAvailableSchedules,
    useCreateSession,
} from "./hooks/use-mentoring-sessions";
import { sessionBookingService } from "./services/mentorService";
import {
    type AvailableSlots,
    type CourseDisplay,
    type FormErrors,
    type MentorDisplay,
    type ScheduleData,
    type ScheduleResponse,
    type SelectedSlot,
    SessionType,
} from "./types";

export const SessionsBookingPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const mentorId = searchParams.get("mentorId");
    const courseId = searchParams.get("courseId");
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);
    const [sessionType, setSessionType] = useState<SessionType>(
        SessionType.Virtual,
    );
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [mentor, setMentor] = useState<MentorDisplay | null>(null);
    const [course, setCourse] = useState<CourseDisplay | null>(null);
    const [initialLoading, setInitialLoading] = useState(true);
    const [availableSlots, setAvailableSlots] = useState<AvailableSlots>({});
    const [loadedMentorId, setLoadedMentorId] = useState<string | null>(null);
    const [currentMonth, setCurrentMonth] = useState(() => {
        const today = new Date();
        return new Date(today.getFullYear(), today.getMonth(), 1);
    });

    const dateRange = useMemo(() => {
        const selectedMonth = selectedDate.getMonth();
        const selectedYear = selectedDate.getFullYear();

        const startDate = new Date(selectedYear, selectedMonth - 3, 1);
        const endDate = new Date(selectedYear, selectedMonth + 4, 0);

        return {
            startDate: startDate.toISOString().split("T")[0],
            endDate: endDate.toISOString().split("T")[0],
        };
    }, [selectedDate]);

    const { schedules, isPending: schedulesLoading } = useAvailableSchedules(
        {
            mentorId: mentorId || loadedMentorId || "",
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
        },
        !!(mentorId || loadedMentorId),
    );

    console.log(schedules, "schedules");

    const { mutate: createSession, isPending: isCreatingSession } =
        useCreateSession();

    const loadData = useCallback(async () => {
        if (!courseId) return;

        setInitialLoading(true);

        try {
            const courseData =
                await sessionBookingService.getCourseById(courseId);

            if (courseData) {
                setCourse({
                    title: courseData.title,
                    description: courseData.description,
                    category: courseData.category.name,
                    level:
                        CourseLevelMap[courseData.level] ||
                        `Level ${courseData.level}`,
                });

                if (!mentorId) {
                    const mentorData =
                        await sessionBookingService.getMentorByCourseId(
                            courseId,
                        );
                    if (mentorData) {
                        setLoadedMentorId(mentorData.id);

                        const mentorCourse = mentorData.courses.find(
                            (c) => c.id === courseId,
                        );
                        setMentor({
                            fullName: mentorData.fullName,
                            email: mentorData.email,
                            avatarUrl: mentorData.avatarUrl,
                            expertise: mentorData.expertise,
                            course: mentorCourse
                                ? {
                                      title: mentorCourse.title,
                                      description: mentorCourse.description,
                                      category: mentorCourse.category.name,
                                      level: `Level ${mentorCourse.level}`,
                                  }
                                : {
                                      title: "Course information not available",
                                      description: "",
                                      category: "",
                                      level: "",
                                  },
                        });
                    }
                }
            }
        } catch (error) {
            console.error("Error loading data:", error);
        } finally {
            setInitialLoading(false);
        }
    }, [mentorId, courseId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    useEffect(() => {
        if (!schedules || !Array.isArray(schedules) || schedules.length === 0) {
            return;
        }

        const scheduleData: ScheduleData[] = schedules.map(
            (schedule: ScheduleResponse | ScheduleData) => ({
                id: schedule.id,
                date: schedule.date || new Date().toISOString().split("T")[0],
                startTime: schedule.startTime || "00:00",
                endTime: schedule.endTime || "01:00",
            }),
        );

        const processedSlots = processSchedulesToSlots(scheduleData);

        setAvailableSlots((prev) => {
            const prevKeys = Object.keys(prev);
            const newKeys = Object.keys(processedSlots);

            if (prevKeys.length !== newKeys.length) {
                return processedSlots;
            }

            const isDifferent = newKeys.some(
                (key) =>
                    !prev[key] ||
                    prev[key].length !== processedSlots[key].length,
            );

            return isDifferent ? processedSlots : prev;
        });
    }, [schedules]);

    useEffect(() => {
        const newMonth = new Date(
            selectedDate.getFullYear(),
            selectedDate.getMonth(),
            1,
        );

        if (newMonth.getTime() !== currentMonth.getTime()) {
            setCurrentMonth(newMonth);
            setAvailableSlots({});
        }
    }, [selectedDate, currentMonth]);

    useEffect(() => {
        if (!selectedSlot) return;

        const selectedSlotDate = new Date(selectedSlot.date);
        if (
            selectedSlotDate.getMonth() !== selectedDate.getMonth() ||
            selectedSlotDate.getFullYear() !== selectedDate.getFullYear()
        ) {
            setSelectedSlot(null);
        }
    }, [selectedDate, selectedSlot]);

    const handleDateSelect = useCallback(
        (date: Date) => {
            setSelectedDate(date);
            setSelectedSlot(null);

            // Update current month if user navigated to a different month
            const newMonth = new Date(date.getFullYear(), date.getMonth(), 1);
            if (newMonth.getTime() !== currentMonth.getTime()) {
                setCurrentMonth(newMonth);
            }
        },
        [currentMonth],
    );

    const handleSlotSelect = useCallback(
        (date: Date, time: string) => {
            const dateKey = date.toDateString();
            const slot = availableSlots[dateKey]?.find((s) => s.time === time);

            if (!slot?.scheduleId) return;

            const slotKey = `${dateKey}-${time}`;

            setSelectedSlot((prevSlot) => {
                if (prevSlot?.key === slotKey) {
                    return null;
                } else {
                    return {
                        key: slotKey,
                        date: dateKey,
                        time: time,
                        dateObj: date,
                        scheduleId: slot.scheduleId,
                    };
                }
            });
        },
        [availableSlots],
    );

    const handleSessionTypeChange = useCallback((type: SessionType) => {
        setSessionType(type);
    }, []);

    const validateForm = useCallback(() => {
        const newErrors: FormErrors = {};

        if (!selectedSlot) {
            newErrors.slot = "Please select a time slot";
        }

        if (!courseId) {
            newErrors.general = "Course information is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [selectedSlot, courseId]);

    const handleBookSession = useCallback(async () => {
        if (!validateForm() || !selectedSlot?.scheduleId || !courseId) return;

        try {
            createSession(
                {
                    scheduleId: selectedSlot.scheduleId,
                    courseId: courseId,
                    sessionType: sessionType,
                },
                {
                    onSuccess: () => {
                        setErrors({});
                        setTimeout(() => {
                            setShowConfirmation(true);
                        }, 100);
                    },
                    onError: (error: unknown) => {
                        console.error("Error booking session:", error);
                    },
                },
            );
        } catch (error) {
            console.error("Error in handleBookSession:", error);
        }
    }, [validateForm, selectedSlot, courseId, sessionType, createSession]);

    if (initialLoading || schedulesLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <LoadingSpinner size="lg" />
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        Loading booking information...
                    </p>
                </div>
            </div>
        );
    }

    if (showConfirmation && selectedSlot) {
        return (
            <BookingConfirmation
                mentor={mentor!}
                selectedSlot={selectedSlot}
                sessionType={sessionType}
            />
        );
    }

    return (
        <div className="min-h-screen px-4 py-8 transition-colors">
            <div className="mx-auto max-w-6xl">
                {/* Mentor Information */}
                {mentor && (
                    <div className="mb-8">
                        <MentorCard mentor={mentor} />
                    </div>
                )}

                {/* Course Information */}
                {course && (
                    <div className="mb-8">
                        <CourseDetailCard course={course} />
                    </div>
                )}

                <div className="space-y-8">
                    {/* Date & Time Selection */}
                    <div>
                        <h2 className="mb-6 text-2xl font-bold text-gray-800 transition-colors dark:text-gray-100">
                            Select date and time
                        </h2>

                        {Object.keys(availableSlots).length === 0 ? (
                            <Alert className="mb-6">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    No available time slots found for this
                                    mentor. Please try again later or contact
                                    support.
                                </AlertDescription>
                            </Alert>
                        ) : (
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                {/* Calendar Component */}
                                <Calendar
                                    selectedDate={selectedDate}
                                    onDateSelect={handleDateSelect}
                                    availableSlots={availableSlots}
                                />

                                {/* Time Slots Component */}
                                <TimeSlots
                                    selectedDate={selectedDate}
                                    selectedSlot={selectedSlot}
                                    availableSlots={availableSlots}
                                    onSlotSelect={handleSlotSelect}
                                />
                            </div>
                        )}

                        {errors.slot && (
                            <Alert variant="destructive" className="mt-4">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    {errors.slot}
                                </AlertDescription>
                            </Alert>
                        )}

                        {errors.general && (
                            <Alert variant="destructive" className="mt-4">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    {errors.general}
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>

                    {/* Session Type Selector */}
                    <div className="mt-6">
                        <SessionTypeSelector
                            sessionType={sessionType}
                            onSessionTypeChange={handleSessionTypeChange}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-between">
                        <Button
                            onClick={handleBookSession}
                            disabled={
                                isCreatingSession ||
                                !selectedSlot ||
                                Object.keys(availableSlots).length === 0
                            }
                            className="h-12 flex-1 bg-blue-600 text-base font-medium transition-colors hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                        >
                            {isCreatingSession ? (
                                <>
                                    <LoadingSpinner />
                                    Processing...
                                </>
                            ) : (
                                "Book Session"
                            )}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => navigate(-1)}
                            disabled={isCreatingSession}
                            className="h-12 text-base font-medium transition-colors dark:border-gray-700 dark:hover:bg-gray-700"
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
