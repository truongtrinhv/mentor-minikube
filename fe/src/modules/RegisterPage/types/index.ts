import type { z } from "zod";
import type { accountSchema, profileSchema, preferencesSchema } from "../utils/schemas";
import type { UseFormReturn } from "react-hook-form";

// Define types from schemas
export type AccountFormValues = z.infer<typeof accountSchema>;
export type ProfileFormValues = z.infer<typeof profileSchema>;
export type PreferencesFormValues = z.infer<typeof preferencesSchema>;

export type AccountStepProps = {
    form: UseFormReturn<AccountFormValues>;
    onOpenTermsDialog: () => void;
    onOpenPrivacyDialog: () => void;
};

export type ProfileStepProps = {
    form: UseFormReturn<ProfileFormValues>;
    avatarPreview: string | null;
    onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    hideRoleSelection?: boolean;
};

export type SessionFrequencyType = "Weekly" | "Every two weeks" | "Monthly" | "As Needed";
export type SessionDurationType = "30 minutes" | "45 minutes" | "1 hour" | "1.5 hours" | "2 hours";

export type PreferencesStepProps = {
    form: UseFormReturn<PreferencesFormValues>;
    role: "Learner" | "Mentor";
    onSubmit: () => void;
};

export type CourseCategory = {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export type Expertise = {
  id: string;
  name: string;
}

export enum Role {
    Admin = 0,
    Mentor = 1,
    Learner = 2,
    All = 3,
}

export enum CommunicationPreference {
    Video = 0,
    Audio = 1,
    Text = 2,
}

export enum UserAvailability {
    Weekdays = 0,
    Weekends = 1,
    Mornings = 2,
    Afternoons = 3,
    Evenings = 4,
}

export enum SessionFrequency {
    Week = 0,
    TwoWeek = 1,
    Month = 2,
    AsNeeded = 3,
}

export enum LearningStyle {
    Visual = 0,
    Auditory = 1,
    ReadWriting = 2,
    Kinesthetic = 3,
}

export enum TeachingStyle {
    HandsOnPractice = 0,
    DiscussionBased = 1,
    ProjectBased = 2,
    LectureStyle = 3,
}

export type RegisterRequest = {
    email: string;
    password: string;
    avatarUrl?: File | null;
    fullName: string;
    role: Role;
    bio?: string | null;
    isNotification?: boolean;
    isReceiveMessage?: boolean;
    isPrivateProfile?: boolean;
    expertises?: string[] | null;
    professionalSkill?: string | null;
    experience?: string | null;
    communicationPreference?: CommunicationPreference | null;
    goals?: string | null;
    availability?: UserAvailability[] | null;
    courseCategoryIds?: string[] | null;
    sessionFrequency: SessionFrequency;
    duration: number;
    learningStyle?: LearningStyle | null;
    teachingStyles?: TeachingStyle[] | null;
};

