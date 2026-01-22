import { courseServices } from "@/common/services/courseServices";
import type { Course } from "@/common/types/course";
import mentorService from "@/modules/LearnerPages/FindMentorsPage/services/mentorService";
import type {
    MentorQueryParams,
    MentorWithCourses,
} from "@/modules/LearnerPages/FindMentorsPage/types";

export const sessionBookingService = {
    async getMentorByCourseId(
        courseId: string,
    ): Promise<MentorWithCourses | null> {
        try {
            const queryParams: MentorQueryParams = {
                pageNumber: 1,
                pageSize: 100,
                search: "",
                categoryId: "",
            };

            const response =
                await mentorService.getAllMentorsWithCourses(queryParams);
            const mentor = response.data?.items?.find((m: MentorWithCourses) =>
                m.courses.some((course) => course.id === courseId),
            );
            return mentor || null;
        } catch (error) {
            console.error("Error fetching mentor by course:", error);
            return null;
        }
    },

    async getCourseById(courseId: string): Promise<Course | null> {
        try {
            const response = await courseServices.getById(courseId);
            return response.data || null;
        } catch (error) {
            console.error("Error fetching course:", error);
            return null;
        }
    },
};
