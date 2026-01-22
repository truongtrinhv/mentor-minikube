using MentorPlatform.Application.Commons.Models.Lookup;
using MentorPlatform.Application.Commons.Models.Responses.LearnerDashboardResponses;
using MentorPlatform.Application.Identity;
using MentorPlatform.Domain.Enums;
using MentorPlatform.Domain.Repositories;
using MentorPlatform.Domain.Shared;

namespace MentorPlatform.Application.UseCases.LearnerDashboardUseCases;

public class LearnerDashboardServices : ILearnerDashboardServices
{
    private readonly IMentoringSessionRepository _mentoringSessionRepository;
    private readonly ICourseRepository _courseRepository;
    private readonly IExecutionContext _executionContext;

    public LearnerDashboardServices(
        IMentoringSessionRepository mentoringSessionRepository,
        IExecutionContext executionContext,
        ICourseRepository courseRepository)
    {
        _mentoringSessionRepository = mentoringSessionRepository;
        _executionContext = executionContext;
        _courseRepository = courseRepository;
    }

    public async Task<Result> GetDashboardStatsAsync()
    {
        var userId = _executionContext.GetUserId();

        var allSessionsQuery = _mentoringSessionRepository.GetQueryable()
            .Where(ms => ms.LearnerId == userId);

        var allSessions = await _mentoringSessionRepository.ToListAsync(allSessionsQuery);
        
        var enrolledCoursesCount = allSessions
            .Where(ms => ms.RequestStatus == RequestMentoringSessionStatus.Completed || 
                        ms.RequestStatus == RequestMentoringSessionStatus.Scheduled)
            .Select(ms => ms.CourseId)
            .Distinct()
            .Count();

        var upcomingSessionsQuery = allSessionsQuery
            .Where(ms => ms.Schedule.StartTime > DateTime.UtcNow &&
                        (ms.RequestStatus == RequestMentoringSessionStatus.Scheduled));
        var totalUpcomingSessions = await _mentoringSessionRepository.CountAsync(upcomingSessionsQuery);

        var completedSessionsQuery = allSessionsQuery
            .Where(ms => ms.RequestStatus == RequestMentoringSessionStatus.Completed);
        var totalCompletedSessions = await _mentoringSessionRepository.CountAsync(completedSessionsQuery);

        var stats = new DashboardStatsResponse
        {
            TotalEnrolledCourses = enrolledCoursesCount,
            TotalUpcomingSessions = totalUpcomingSessions,
            TotalCompletedSessions = totalCompletedSessions
        };

        return Result<DashboardStatsResponse>.Success(stats);
    }

    public async Task<Result> GetUpcomingSessionAsync()
    {
        var currentLearner = _executionContext.GetUser();
        var query = _mentoringSessionRepository.GetQueryable()
            .Where(ms => ms.LearnerId == currentLearner!.Id &&
                         ms.Schedule.StartTime > DateTime.UtcNow &&
                         (ms.RequestStatus == RequestMentoringSessionStatus.Scheduled))
            .OrderByDescending(ms => ms.Schedule.StartTime).Take(10)
            .Select(x => new LeanerUpcommingSessionReponse()
            {
                Id = x.Id,
                CourseTitle = x.Course.Title,
                MentorName = x.Course.Mentor.UserDetail.FullName,
                MentorAvatar = x.Course.Mentor.UserDetail.AvatarUrl ?? string.Empty,
                ScheduledDate = x.Schedule.StartTime,
                StartTime = x.Schedule.StartTime,
                EndTime = x.Schedule.EndTime,
                SessionType = x.SessionType,
                Status = x.RequestStatus
            });

        var upcomingSessions = await _mentoringSessionRepository.ToListAsync(query);
        return Result<List<LeanerUpcommingSessionReponse>>.Success(upcomingSessions);
    }

    public async Task<Result> GetEnrolledCoursesAsync()
    {
        var learnerId = _executionContext.GetUserId();
        var query = _courseRepository.GetQueryable()
            .Where(c => c.MentoringSessions != null && c.MentoringSessions
                        .Any(ms => ms.LearnerId == learnerId
                             && (ms.RequestStatus == RequestMentoringSessionStatus.Scheduled
                                || ms.RequestStatus == RequestMentoringSessionStatus.Completed)
                        )
            ).Select(x => new EnrolledCourseResponse()
            {
                Id = x.Id,
                Title = x.Title,
                Description = x.Description,
                MentorAvatar = x.Mentor.UserDetail.AvatarUrl ?? string.Empty,
                MentorName = x.Mentor.UserDetail.FullName,
                MentorEmail = x.Mentor.Email,
                Category = new LookupModel
                {
                    Id = x.CourseCategory.Id,
                    Name = x.CourseCategory.Name
                },
                Level = x.Level,
                LearnerCount = x.MentoringSessions!
                                .Where(ms => ms.RequestStatus == RequestMentoringSessionStatus.Scheduled || ms.RequestStatus == RequestMentoringSessionStatus.Completed)
                                 .GroupBy(ms => ms.LearnerId).Count(),
                ScheduledSessionCount = x.MentoringSessions!
                                .Count(ms => ms.LearnerId == learnerId && ms.RequestStatus == RequestMentoringSessionStatus.Scheduled),
                CompletedSessionCount = x.MentoringSessions!
                                .Count(ms => ms.LearnerId == learnerId && ms.RequestStatus == RequestMentoringSessionStatus.Completed),

            });
        var enrolledCourses = await _mentoringSessionRepository.ToListAsync(query);
        return Result<List<EnrolledCourseResponse>>.Success(enrolledCourses);
    }


}