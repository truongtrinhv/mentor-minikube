export type CourseCategoryLookUpResponse = {
    id: string;
    name: string;
};

export type CourseCategoryResponse = {
    id: string;
    name: string;
    description: string;
    courseCount: number;
    isActive: boolean;
};
export type CourseResponse = {
    id: string;
    title: string;
    description: string;
    level: number;
};
export type CourseCategoryDetailResponse = CourseCategoryResponse & {
    courses: CourseResponse[];
};

export const defaultCourseCategoryDetail: CourseCategoryDetailResponse = {
    id: "",
    name: "",
    description: "",
    courseCount: 0,
    isActive: false,
    courses: [],
};
