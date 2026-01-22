import { useQuery } from "@tanstack/react-query";

import mentorService from "../services/mentorService";
import type { MentorQueryParams, MentorWithCourses } from "../types";

export const useMentors = (queryParams: MentorQueryParams) => {
    const {
        data: response,
        isPending,
        error,
        refetch,
    } = useQuery({
        queryKey: ["mentors", queryParams],
        queryFn: () => mentorService.getAllMentorsWithCourses(queryParams),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    const mentors: MentorWithCourses[] = response?.data?.items || [];
    const totalCount = response?.data?.totalCount || 0;
    const pageSize = response?.data?.pageSize || queryParams.pageSize;
    const pageNumber = response?.data?.pageNumber || queryParams.pageNumber;

    return {
        mentors,
        totalCount,
        pageSize,
        pageNumber,
        isPending,
        error,
        refetch,
    };
};
