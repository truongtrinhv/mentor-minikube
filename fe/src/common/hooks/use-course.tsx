import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import { courseServices } from "@/common/services/courseServices";

import type { Course } from "../types/course";

export const useCourse = (courseId: string) => {
    const { data, isPending, error } = useQuery<Course | undefined | null>({
        queryKey: ["courses", courseId],
        queryFn: async () => {
            try {
                const res = await courseServices.getById(courseId);
                return res.data;
            } catch (error) {
                if (
                    axios.isAxiosError(error) &&
                    error.response?.status === 404
                ) {
                    return null;
                }
                throw error;
            }
        },
    });

    return {
        course: data,
        isPending,
        error,
    };
};
