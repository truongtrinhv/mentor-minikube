import { httpClient } from "@/common/api/instance.axios";
import {
    type Course,
    type CourseQueryParams,
    defaultCourseQueryParams,
} from "@/common/types/course";
import type { PaginationResult } from "@/common/types/result";

import type { CourseFormData, CourseResponse } from "../types/course";
import type { Lookup } from "../types/lookup";

export const courseServices = {
    getAll: (params: CourseQueryParams = defaultCourseQueryParams) =>
        httpClient.get<PaginationResult<Course>>("/courses", { params }),
    getAllForLearner: (params: CourseQueryParams = defaultCourseQueryParams) =>
        httpClient.get<PaginationResult<Course>>("/my-courses", { params }),
    getById: (courseId: string) =>
        httpClient.get<Course>(`/courses/${courseId}`),
    create: (data: CourseFormData) => httpClient.post<Course>("/courses", data),
    update: (courseId: string, data: CourseFormData) =>
        httpClient.put(`/courses/${courseId}`, data),
    delete: (courseId: string) => httpClient.delete(`/courses/${courseId}`),
    getTopCourses: () =>
        httpClient.get<CourseResponse[]>("/mentors/top-courses"),
    lookup: (search: string | null) =>
        httpClient.get<Lookup[]>(
            `courses/look-up${search ? `?search=${encodeURIComponent(search)}` : ""}`,
        ),
};
