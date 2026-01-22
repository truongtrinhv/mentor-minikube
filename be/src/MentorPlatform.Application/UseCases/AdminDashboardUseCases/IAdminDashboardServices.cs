using MentorPlatform.Domain.Shared;

namespace MentorPlatform.Application.UseCases.AdminDashboardUseCases;

public interface IAdminDashboardServices
{
    public Task<Result> GetUserStatsAsync();
    public Task<Result> GetCourseAndResourceStatsAsync();
    public Task<Result> GetMostPopularCoursesAsync();
    public Task<Result> GetSessionStatsAsync();
}