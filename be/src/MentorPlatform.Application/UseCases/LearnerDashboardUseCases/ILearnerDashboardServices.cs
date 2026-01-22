using MentorPlatform.Domain.Shared;

namespace MentorPlatform.Application.UseCases.LearnerDashboardUseCases;

public interface ILearnerDashboardServices
{
    Task<Result> GetDashboardStatsAsync();
    Task<Result> GetUpcomingSessionAsync();
    Task<Result> GetEnrolledCoursesAsync();
}