export type {
    MentorWithCourses,
    CourseDetailsResponse,
    CourseDetailsCategoryResponse,
} from "@/modules/LearnerPages/FindMentorsPage/types";

export enum SessionType {
    Virtual = 0,
    InPerson = 1,
    OnSite = 2,
}

export type ScheduleData = {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
};

export type ProcessedTimeSlot = {
    time: string;
    startTime: string;
    endTime: string;
    available: boolean;
    scheduleId: string;
};

export type AvailableSlots = {
    [dateKey: string]: ProcessedTimeSlot[];
};

export type SelectedSlot = {
    key: string;
    date: string;
    time: string;
    dateObj: Date;
    scheduleId?: string;
};

export type FormErrors = {
    slot?: string;
    general?: string;
};

export type MentorDisplay = {
    fullName: string;
    email: string;
    avatarUrl?: string;
    expertise: string[];
    course: {
        title: string;
        description: string;
        category: string;
        level: string;
    };
};

export type CourseDisplay = {
    title: string;
    description: string;
    category: string;
    level: string;
};

export type SessionTypeOption = {
    value: SessionType;
    label: string;
    icon: any;
    description?: string;
};

export type ScheduleQueryParameters = {
    mentorId: string;
    startDate: string;
    endDate: string;
};

export type ScheduleResponse = {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
};

export type CreateSessionRequest = {
    scheduleId: string;
    courseId: string;
    sessionType: SessionType;
};

export type CreateSessionResponse = {
    message: string;
};

export type ApiResponse<T> = {
    data: T;
    isSuccess: boolean;
    statusCode: number;
    errors: string[];
};
