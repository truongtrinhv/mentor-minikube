import type { QueryParameters } from "@/common/types/query";

export type CourseDetailsCategoryResponse = {
    id: string;
    name: string;
};

export type CourseDetailsResponse = {
    id: string;
    title: string;
    description: string;
    level: number;
    learnerCount: number;
    category: CourseDetailsCategoryResponse;
    mentor?: {
        id: string;
        fullName: string;
        avatarUrl?: string;
        experience?: string;
        email?: string;
        expertises?: Array<{
            id: string;
            name: string;
        }>;
    };
};

export type MentorWithCourses = {
    id: string;
    fullName: string;
    email: string;
    avatarUrl?: string;
    expertise: string[];
    bio?: string;
    courses: CourseDetailsResponse[];
};

export type MentorQueryParams = QueryParameters & {
    search: string;
    categoryId: string;
};

export const defaultMentorQueryParams: MentorQueryParams = {
    pageNumber: 1,
    pageSize: 8,
    search: "",
    categoryId: "",
};

export type MentorsApiResponse = {
    pageSize: number;
    pageNumber: number;
    totalCount: number;
    items: MentorWithCourses[];
};
