import type z from "zod";

import { type QueryParameters, defaultQuery } from "@/common/types/query";

import type { Resource } from "./resource";

import type { courseFormDataSchema } from "../schemas/course";

export type CourseFormData = z.infer<typeof courseFormDataSchema>;

export const CourseLevelMap = {
    0: "Beginner",
    1: "Intermediate",
    2: "Advanced",
} as const;
export type CourseLevel = keyof typeof CourseLevelMap;

export type Course = {
    id: string;
    title: string;
    learnerCount: number;
    description: string;
    category: {
        id: string;
        name: string;
    };
    level: CourseLevel;
    hasAccessResourcePermission: boolean;
    mentor: {
        fullName: string;
        avatarUrl?: string | null;
        experience?: string | null;
    };
    resources: Resource[];
};

export type CourseResponse = {
    id: string;
    title: string;
    learnerCount: number;
    description: string;
    categoryName: string;
    level: CourseLevel;
};

export type CourseQueryParams = QueryParameters & {
    categoryId: string;
    level: CourseLevel | "";
    mentorId: string;
};

export const defaultCourseQueryParams: CourseQueryParams = {
    ...defaultQuery,
    categoryId: "",
    level: "",
    mentorId: "",
};
