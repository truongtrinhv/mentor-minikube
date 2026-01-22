export enum TimeSlotStatus {
    Available = 0,
    Unavailable = 1,
}

export type TimeBlockRequest = {
    startTime: string;
    endTime: string;
};

export type CreateScheduleRequest = {
    timeBlocks: TimeBlockRequest[];
    isRepeating: boolean;
    repeatingWeeks: number;
};

export type EditScheduleRequest = {
    timeBlock: TimeBlockRequest;
};

export type TimeSlotResponse = {
    id: string;
    startTime: string;
    endTime: string;
    status: TimeSlotStatus;
    date?: string;
};

export type DayTimeSlotsResponse = {
    date: string;
    timeSlots: TimeSlotResponse[];
};

export type ScheduleResponse = {
    id: string;
    mentorId: string;
    startTime: string;
    endTime: string;
    createdAt?: string;
    updatedAt?: string;
};

export type GetTimeSlotsParams = {
    startDate: string;
    endDate: string;
};
