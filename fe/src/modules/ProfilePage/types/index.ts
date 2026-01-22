import type { Role } from "@/common/types/auth";

export const AVAILABILITY_ENUM = {
    Weekdays: 0,
    Weekends: 1,
    Mornings: 2,
    Afternoons: 3,
    Evenings: 4,
} as const;

export const COMMUNICATION_PREFERENCE_ENUM = {
    VideoCall: 0,
    AudioCall: 1,
    TextChat: 2,
} as const;

export const SESSION_FREQUENCY_ENUM = {
    Weekly: 0,
    EveryTwoWeeks: 1,
    Monthly: 2,
    AsNeeded: 3,
} as const;

export const DURATION_ENUM = {
    ThirtyMinutes: 0,
    FortyFiveMinutes: 1,
    OneHour: 2,
    OneHalfHours: 3,
    TwoHours: 4,
} as const;

export const LEARNING_STYLE_ENUM = {
    Visual: 0,
    Auditory: 1,
    ReadingWriting: 2,
    Kinesthetic: 3,
} as const;

export const TEACHING_STYLE_ENUM = {
    Handson: 0,
    Discussion: 1,
    Project: 2,
    Lecture: 3,
} as const;

// Helper functions để convert giữa UI và API
export const availabilityToEnum = (value: string): number => {
    const mapping: Record<string, number> = {
        Weekdays: AVAILABILITY_ENUM.Weekdays,
        Weekends: AVAILABILITY_ENUM.Weekends,
        Mornings: AVAILABILITY_ENUM.Mornings,
        Afternoons: AVAILABILITY_ENUM.Afternoons,
        Evenings: AVAILABILITY_ENUM.Evenings,
    };
    return mapping[value] ?? 0;
};

export const availabilityFromEnum = (value: number): string => {
    const mapping: Record<number, string> = {
        [AVAILABILITY_ENUM.Weekdays]: "Weekdays",
        [AVAILABILITY_ENUM.Weekends]: "Weekends",
        [AVAILABILITY_ENUM.Mornings]: "Mornings",
        [AVAILABILITY_ENUM.Afternoons]: "Afternoons",
        [AVAILABILITY_ENUM.Evenings]: "Evenings",
    };
    return mapping[value] ?? "Weekdays";
};

export const communicationToEnum = (value: string): number => {
    const mapping: Record<string, number> = {
        "Video call": COMMUNICATION_PREFERENCE_ENUM.VideoCall,
        "Audio call": COMMUNICATION_PREFERENCE_ENUM.AudioCall,
        "Text chat": COMMUNICATION_PREFERENCE_ENUM.TextChat,
    };
    return mapping[value] ?? 0;
};

export const communicationFromEnum = (value: number): string => {
    const mapping: Record<number, string> = {
        [COMMUNICATION_PREFERENCE_ENUM.VideoCall]: "Video call",
        [COMMUNICATION_PREFERENCE_ENUM.AudioCall]: "Audio call",
        [COMMUNICATION_PREFERENCE_ENUM.TextChat]: "Text chat",
    };
    return mapping[value] ?? "Video call";
};

export const sessionFrequencyToEnum = (value: string): number => {
    const mapping: Record<string, number> = {
        Weekly: SESSION_FREQUENCY_ENUM.Weekly,
        "Every two weeks": SESSION_FREQUENCY_ENUM.EveryTwoWeeks,
        Monthly: SESSION_FREQUENCY_ENUM.Monthly,
        "As Needed": SESSION_FREQUENCY_ENUM.AsNeeded,
    };
    return mapping[value] ?? 0;
};

export const sessionFrequencyFromEnum = (value: number): string => {
    const mapping: Record<number, string> = {
        [SESSION_FREQUENCY_ENUM.Weekly]: "Weekly",
        [SESSION_FREQUENCY_ENUM.EveryTwoWeeks]: "Every two weeks",
        [SESSION_FREQUENCY_ENUM.Monthly]: "Monthly",
        [SESSION_FREQUENCY_ENUM.AsNeeded]: "As Needed",
    };
    return mapping[value] ?? "Weekly";
};

export const durationToEnum = (value: string): number => {
    const mapping: Record<string, number> = {
        "30 minutes": DURATION_ENUM.ThirtyMinutes,
        "45 minutes": DURATION_ENUM.FortyFiveMinutes,
        "1 hour": DURATION_ENUM.OneHour,
        "1.5 hours": DURATION_ENUM.OneHalfHours,
        "2 hours": DURATION_ENUM.TwoHours,
    };
    return mapping[value] ?? 2;
};

export const durationFromEnum = (value: number): string => {
    const mapping: Record<number, string> = {
        [DURATION_ENUM.ThirtyMinutes]: "30 minutes",
        [DURATION_ENUM.FortyFiveMinutes]: "45 minutes",
        [DURATION_ENUM.OneHour]: "1 hour",
        [DURATION_ENUM.OneHalfHours]: "1.5 hours",
        [DURATION_ENUM.TwoHours]: "2 hours",
    };
    return mapping[value] ?? "1 hour";
};

export const learningStyleToEnum = (value: string): number => {
    const mapping: Record<string, number> = {
        Visual: LEARNING_STYLE_ENUM.Visual,
        Auditory: LEARNING_STYLE_ENUM.Auditory,
        "Reading/Writing": LEARNING_STYLE_ENUM.ReadingWriting,
        Kinesthetic: LEARNING_STYLE_ENUM.Kinesthetic,
    };
    return mapping[value] ?? 0;
};

export const learningStyleFromEnum = (value: number): string => {
    const mapping: Record<number, string> = {
        [LEARNING_STYLE_ENUM.Visual]: "Visual",
        [LEARNING_STYLE_ENUM.Auditory]: "Auditory",
        [LEARNING_STYLE_ENUM.ReadingWriting]: "Reading/Writing",
        [LEARNING_STYLE_ENUM.Kinesthetic]: "Kinesthetic",
    };
    return mapping[value] ?? "Visual";
};

export const teachingStyleToEnum = (value: string): number => {
    const mapping: Record<string, number> = {
        handson: TEACHING_STYLE_ENUM.Handson,
        discussion: TEACHING_STYLE_ENUM.Discussion,
        project: TEACHING_STYLE_ENUM.Project,
        lecture: TEACHING_STYLE_ENUM.Lecture,
    };
    return mapping[value] ?? 0;
};

export const teachingStyleFromEnum = (value: number): string => {
    const mapping: Record<number, string> = {
        [TEACHING_STYLE_ENUM.Handson]: "handson",
        [TEACHING_STYLE_ENUM.Discussion]: "discussion",
        [TEACHING_STYLE_ENUM.Project]: "project",
        [TEACHING_STYLE_ENUM.Lecture]: "lecture",
    };
    return mapping[value] ?? "handson";
};

export type EditProfileRequest = {
    fullName?: string;
    bio?: string;
    avatarUrl?: File | null;
    professionalSkill?: string;
    experience?: string;
    goals?: string;
    expertises?: string[];
    courseCategoryIds?: string[];
    availability?: number[];
    communicationPreference?: number;
    sessionFrequency?: number;
    duration?: number;
    learningStyle?: number;
    teachingStyles?: number;
    isNotification?: boolean;
    isReceiveMessage?: boolean;
    isPrivateProfile?: boolean;
};

export type ExpertiseResponse = {
    id: string;
    name: string;
};

export type CourseCategoryResponse = {
    id: string;
    name: string;
    description?: string;
};

export type UserDetailResponse = {
    id: string;
    email: string;
    fullName: string;
    bio?: string;
    avatarUrl?: string;
    role: Role;
    professionalSkill?: string;
    experience?: string;
    goals?: string;
    expertises?: ExpertiseResponse[];
    courseCategories?: CourseCategoryResponse[];
    availability?: number[];
    communicationPreference?: number;
    sessionFrequency?: number;
    duration?: number;
    learningStyle?: number;
    teachingStyles?: number;
    isNotification?: boolean;
    isReceiveMessage?: boolean;
    isPrivateProfile?: boolean;
    isVerifyEmail: boolean;
    isActive: boolean;
};

export type UserPassword = {
    currentPassword: string;
    password: string;
    confirmPassword: string;
};
