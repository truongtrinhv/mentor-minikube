using MentorPlatform.Application.Commons.Models.Requests.CourseRequests;
using MentorPlatform.Application.Commons.Models.Responses.CourseResponses;
using MentorPlatform.Domain.Entities;

namespace MentorPlatform.Application.Commons.Mappings;
public static class CourseMapping
{
    public static Course ToEntity(this CreateCourseRequest request)
    {
        return new Course
        {
            Title = request.Title.Trim(),
            Description = request.Description.Trim(),
            Level = request.Level,
            CourseCategoryId = request.CourseCategoryId,
        };
    }

    public static CourseResponse ToResponse(this Course course, int learnerCount = 0)
    {
        return new CourseResponse
        {
            Id = course.Id,
            Title = course.Title,
            Description = course.Description,
            Level = course.Level,
            CategoryName = course.CourseCategory.Name,
            LearnerCount = learnerCount
        };
    }

    public static CourseResponse ToResponse(this Course course)
    {
        return new CourseResponse
        {
            Id = course.Id,
            Title = course.Title,
            Description = course.Description,
            Level = course.Level,
            CategoryName = course.CourseCategory.Name,
            LearnerCount = -1
        };
    }
}
