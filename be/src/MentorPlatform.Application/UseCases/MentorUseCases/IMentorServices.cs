using MentorPlatform.Application.Commons.Models.Requests.MentorRequests;
using MentorPlatform.Domain.Shared;

namespace MentorPlatform.Application.UseCases.MentorUseCases;

public interface IMentorServices
{
    Task<Result> GetAllMentorsWithCoursesAsync(MentorQueryParameters queryParameters);
    Task<Result> GetTopMentorCourses(int courseNumber = 5);
    Task<Result> GetUpcomingSessions(int sessionNumber = 5);
    Task<Result> GetNotifications(int notificationNumber = 5);
}