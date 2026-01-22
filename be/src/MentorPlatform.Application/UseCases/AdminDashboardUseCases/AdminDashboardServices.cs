using MentorPlatform.Application.Commons.Models.Responses.AdminDashboardResponses;
using MentorPlatform.Domain.Entities;
using MentorPlatform.Domain.Enums;
using MentorPlatform.Domain.Repositories;
using MentorPlatform.Domain.Shared;

namespace MentorPlatform.Application.UseCases.AdminDashboardUseCases;

public class AdminDashboardServices : IAdminDashboardServices
{
    private readonly IUserRepository _userRepository;
    private readonly IApplicationRequestRepository _applicationRequestRepository;
    private readonly ICourseRepository _courseRepository;
    private readonly IResourceRepository _resourceRepository;
    private readonly IMentoringSessionRepository _mentoringSessionRepository;

    public AdminDashboardServices(
        IUserRepository userRepository,
        IApplicationRequestRepository applicationRequestRepository,
        ICourseRepository courseRepository,
        IResourceRepository resourceRepository,
        IMentoringSessionRepository mentoringSessionRepository)
    {
        _userRepository = userRepository;
        _applicationRequestRepository = applicationRequestRepository;
        _courseRepository = courseRepository;
        _resourceRepository = resourceRepository;
        _mentoringSessionRepository = mentoringSessionRepository;
    }

    public async Task<Result> GetUserStatsAsync()
    {
        Dictionary<Role, int> userCountByRole = await _userRepository.CountUsersByRoleAsync();

        var now = DateTime.UtcNow;
        var startOfThisMonth = new DateTime(now.Year, now.Month, 1);
        var startOfNextMonth = startOfThisMonth.AddMonths(1);
        var newUsersThisMonthQueryable = _userRepository.GetQueryable()
            .Where(u => u.IsActive &&
                        u.IsVerifyEmail &&
                        u.CreatedAt >= startOfThisMonth && u.CreatedAt < startOfNextMonth);
        int newUsersThisMonth = await _userRepository.CountAsync(newUsersThisMonthQueryable);

        var unapprovedMentorsQueryable = _userRepository.GetQueryable()
            .Where(u => u.IsActive &&
                   u.IsVerifyEmail &&
                   u.Role == Role.Mentor &&
                   u.ApplicationRequests != null &&
                   !u.ApplicationRequests.Any(ar => ar.Status == ApplicationRequestStatus.Approved));
        int unapprovedMentors = await _userRepository.CountAsync(unapprovedMentorsQueryable);

        var pendingApplicationsQueryable = _applicationRequestRepository.GetQueryable().Where(ar => ar.Status == ApplicationRequestStatus.Pending ||
                                                                                                    ar.Status == ApplicationRequestStatus.UnderReview);
        int pendingApplications = await _applicationRequestRepository.CountAsync(pendingApplicationsQueryable);

        var pendingApplicationsThisMonthQueryable = pendingApplicationsQueryable.Where(ar => ar.CreatedAt >= startOfThisMonth && ar.CreatedAt < startOfNextMonth);
        int pendingApplicationsThisMonth = await _applicationRequestRepository.CountAsync(pendingApplicationsThisMonthQueryable);

        var response = new UserStatsResponse()
        {
            ActiveUserCount = userCountByRole.Values.Sum(),
            NewUsersThisMonth = newUsersThisMonth,
            ActiveAdminCount = userCountByRole.GetValueOrDefault(Role.Admin),
            ActiveMentorCount = userCountByRole.GetValueOrDefault(Role.Mentor),
            ActiveLearnerCount = userCountByRole.GetValueOrDefault(Role.Learner),
            ActiveApprovedMentorCount = userCountByRole.ContainsKey(Role.Mentor) ? userCountByRole[Role.Mentor] - unapprovedMentors : 0,
            ActiveUnapprovedMentorCount = unapprovedMentors,
            PendingApplicationsCount = pendingApplications,
            PendingApplicationsThisMonth = pendingApplicationsThisMonth
        };

        return Result<UserStatsResponse>.Success(response);
    }

    public async Task<Result> GetCourseAndResourceStatsAsync()
    {
        var now = DateTime.UtcNow;
        var startOfThisMonth = new DateTime(now.Year, now.Month, 1);
        var startOfNextMonth = startOfThisMonth.AddMonths(1);

        var courseQueryable = _courseRepository.GetQueryable();
        int courseCount = await _courseRepository.CountAsync(courseQueryable);

        var newCourseThisMonthQueryable = courseQueryable.Where(c => c.CreatedAt >= startOfThisMonth && c.CreatedAt < startOfNextMonth);
        int newCourseThisMonthCount = await _courseRepository.CountAsync(newCourseThisMonthQueryable);

        var resourceQueryable = _resourceRepository.GetQueryable();
        int resourceCount = await _resourceRepository.CountAsync(resourceQueryable);

        var newResourceThisMonthQueryable = resourceQueryable.Where(r => r.CreatedAt >= startOfThisMonth && r.CreatedAt < startOfNextMonth);
        int newResourceThisMonthCount = await _resourceRepository.CountAsync(newResourceThisMonthQueryable);

        var response = new CourseStatsResponse()
        {
            CourseCount = courseCount,
            NewCourseThisMonthCount = newCourseThisMonthCount,
            ResourceCount = resourceCount,
            NewResourceThisMonthCount = newResourceThisMonthCount
        };

        return Result<CourseStatsResponse>.Success(response);
    }

    public async Task<Result> GetMostPopularCoursesAsync()
    {
        var now = DateTimeOffset.UtcNow;
        var startOfThisMonth = new DateTimeOffset(new DateTime(now.Year, now.Month, 1), TimeSpan.Zero);
        var endOfThisMonth = startOfThisMonth.AddMonths(1).AddMilliseconds(-1);

        Dictionary<Course, int> courseWithSessionCount = await _courseRepository.GetMostPopularCoursesWithSessionCount(startOfThisMonth, endOfThisMonth);

        var courses = courseWithSessionCount.Select(kvp => new MostPopularCourse()
        {
            Id = kvp.Key.Id,
            Title = kvp.Key.Title,
            CategoryName = kvp.Key.CourseCategory.Name,
            SessionCount = kvp.Value,
            MentorName = kvp.Key.Mentor.UserDetail.FullName,
            MentorAvatar = kvp.Key.Mentor.UserDetail.AvatarUrl
        }).ToList();

        var response = new MostPopularCoursesResponse()
        {
            Courses = courses
        };

        return Result<MostPopularCoursesResponse>.Success(response);
    }

    public async Task<Result> GetSessionStatsAsync()
    {
        var now = DateTimeOffset.UtcNow;
        var startOfThisMonth = new DateTimeOffset(new DateTime(now.Year, now.Month, 1), TimeSpan.Zero);
        var endOfThisMonth = startOfThisMonth.AddMonths(1).AddMilliseconds(-1);

        Dictionary<RequestMentoringSessionStatus, int> sessionCountByStatus = await _mentoringSessionRepository.CountSessionsByStatusAsync(startOfThisMonth, endOfThisMonth);

        var response = new SessionStatsResponse()
        {
            SessionThisMonthCount = sessionCountByStatus.Values.Sum(),
            PendingSessionThisMonthCount = sessionCountByStatus.GetValueOrDefault(RequestMentoringSessionStatus.Pending),
            ScheduledSessionThisMonthCount = sessionCountByStatus.GetValueOrDefault(RequestMentoringSessionStatus.Scheduled),
            CompletedSessionThisMonthCount = sessionCountByStatus.GetValueOrDefault(RequestMentoringSessionStatus.Completed),
            ReschedulingSessionThisMonthCount = sessionCountByStatus.GetValueOrDefault(RequestMentoringSessionStatus.Rescheduling),
            CancelledSessionThisMonthCount = sessionCountByStatus.GetValueOrDefault(RequestMentoringSessionStatus.Cancelled),
        };

        return Result<SessionStatsResponse>.Success(response);
    }
}