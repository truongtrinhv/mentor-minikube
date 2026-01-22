import { type QueryParameters, defaultQuery } from "@/common/types/query";

export const UserStatusMap = {
    0: "Active",
    1: "Deactivated",
    2: "Pending",
} as const;

export type UserStatus = keyof typeof UserStatusMap;
export type UserStatusName = (typeof UserStatusMap)[keyof typeof UserStatusMap];

export const RoleMap = {
    0: "Admin",
    1: "Mentor",
    2: "Learner",
} as const;

export type Role = keyof typeof RoleMap;
export type RoleName = (typeof RoleMap)[keyof typeof RoleMap];

export type User = {
    id: string;
    isDeleted: boolean;
    email: string;
    role: Role;
    isNotification: boolean;
    isReceiveMessage: boolean;
    isPrivateProfile: boolean;
    isVerifyEmail: boolean;
    status: UserStatus;
    lastActive: string;
    createdAt: string;
    userDetail: UserDetail;
};

export type UserDetail = {
    id: string;
    userId: string;
    fullName: string;
    bio?: string | null;
    avatarUrl?: string | null;
    experience?: string | null;
    communicationPreference: number;
    professionalSkill?: string | null;
    goals?: string | null;
    duration: number;
    sessionFrequency: number;
    learningStyle?: number | null;
    teachingStyles?: number[] | null;
};

export type UserQueryParams = QueryParameters & {
    role: string[];
};

export const defaultUserQueryParams: UserQueryParams = {
    ...defaultQuery,
    role: [],
};
