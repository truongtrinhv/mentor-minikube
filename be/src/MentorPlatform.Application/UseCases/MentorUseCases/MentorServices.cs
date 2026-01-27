using MentorPlatform.Application.Commons.Errors;
using MentorPlatform.Application.Commons.Mappings;
using MentorPlatform.Application.Commons.Models.Lookup;
using MentorPlatform.Application.Commons.Models.Requests.MentorRequests;
using MentorPlatform.Application.Commons.Models.Responses.CourseResponses;
using MentorPlatform.Application.Commons.Models.Responses.MentoringSessionResponses;
using MentorPlatform.Application.Commons.Models.Responses.MentorResponses;
using MentorPlatform.Application.Commons.Models.Responses.NotificationResponses;
using MentorPlatform.Application.Identity;
using MentorPlatform.Application.Services.Caching;
using MentorPlatform.Domain.Entities;
using MentorPlatform.Domain.Enums;
using MentorPlatform.Domain.Repositories;
using MentorPlatform.Domain.Shared;

namespace MentorPlatform.Application.UseCases.MentorUseCases;

public class MentorServices : IMentorServices
{
    private readonly IUserRepository _userRepository;
    private readonly ICourseRepository _courseRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IExecutionContext _executionContext;
    private readonly IMentoringSessionRepository _sessionRepository;
    private readonly INotificationRepository _notificationRepository;
    private readonly ICacheService _cacheService;

    public MentorServices(
        IUserRepository userRepository,
        ICourseRepository courseRepository,
        IUnitOfWork unitOfWork,
        IExecutionContext executionContext,
        IMentoringSessionRepository sessionRepository,
        INotificationRepository notificationRepository,
        ICacheService cacheService)
    {
        _userRepository = userRepository;
        _courseRepository = courseRepository;
        _unitOfWork = unitOfWork;
        _executionContext = executionContext;
        _sessionRepository = sessionRepository;
        _notificationRepository = notificationRepository;
        _cacheService = cacheService;
    }

    public async Task<Result> GetAllMentorsWithCoursesAsync(MentorQueryParameters queryParameters)
    {
        try
        {
            var searchValue = queryParameters?.Search?.Trim();
            var cacheKey = CacheKeys.MentorsWithCoursesPage(queryParameters!.PageNumber, queryParameters.PageSize, searchValue, queryParameters?.CategoryId);
            
            var result = await _cacheService.GetOrSetPaginatedAsync(
                cacheKey,
                async () =>
                {
                    var mentorsQuery = _userRepository.GetQueryable()
                        .Where(u => u.Role == Role.Mentor && !u.IsDeleted);

                    if (!string.IsNullOrEmpty(searchValue))
                    {
                        mentorsQuery = mentorsQuery.Where(m =>
                            m.UserDetail.FullName.Contains(searchValue) ||
                            m.Email.Contains(searchValue));
                    }

                    var mentors = await _userRepository.ToListAsync(
                        mentorsQuery
                            .Skip((queryParameters!.PageNumber - 1) * queryParameters.PageSize)
                            .Take(queryParameters.PageSize)
                            .Select(m => new MentorWithCoursesResponse
                            {
                                Id = m.Id,
                                FullName = m.UserDetail.FullName,
                                Email = m.Email,
                                AvatarUrl = m.UserDetail.AvatarUrl,
                                Expertise = m.UserExpertises != null && m.UserExpertises.Any()
                                    ? m.UserExpertises.Select(ue => ue.Expertise.Name).ToList()
                                    : new List<string>(),
                                Bio = m.UserDetail.Bio,
                                Courses = new List<CourseDetailsResponse>()
                            }));

                    foreach (var mentor in mentors)
                    {
                        var coursesQuery = _courseRepository.GetQueryable()
                            .Where(c => c.MentorId == mentor.Id && !c.IsDeleted);

                        if (queryParameters?.CategoryId.HasValue == true)
                        {
                            coursesQuery = coursesQuery.Where(c => c.CourseCategoryId == queryParameters.CategoryId.Value);
                        }

                        mentor.Courses = await _courseRepository.ToListAsync(
                            coursesQuery.Select(c => new CourseDetailsResponse
                            {
                                Id = c.Id,
                                Title = c.Title,
                                Description = c.Description,
                                Level = c.Level,
                                LearnerCount = c.MentoringSessions != null ? c.MentoringSessions.GroupBy(s => s.LearnerId).Count() : 0,
                                Category = new CourseDetailsCategoryResponse
                                {
                                    Id = c.CourseCategory.Id,
                                    Name = c.CourseCategory.Name
                                },
                                Mentor = new MentorInfoForCourseResponse
                                {
                                    Id = mentor.Id,
                                    FullName = mentor.FullName,
                                    AvatarUrl = mentor.AvatarUrl,
                                    Email = mentor.Email,
                                    Experience = c.Mentor.UserDetail.Experience,
                                    Expertises = c.Mentor.UserExpertises != null && c.Mentor.UserExpertises.Any()
                                        ? c.Mentor.UserExpertises.Select(ue => new LookupModel
                                        {
                                            Id = ue.ExpertiseId,
                                            Name = ue.Expertise.Name
                                        }).ToList()
                                        : new List<LookupModel>()
                                }
                            }));
                    }

                    if (queryParameters?.CategoryId.HasValue == true)
                    {
                        mentors = mentors.Where(m => m.Courses.Any()).ToList();
                    }

                    var totalCount = await _userRepository.CountAsync(mentorsQuery);

                    var paginationResult = PaginationResult<MentorWithCoursesResponse>.Create(
                        data: mentors,
                        totalCount: totalCount,
                        pageNumber: queryParameters!.PageNumber,
                        pageSize: queryParameters.PageSize);
                    
                    return paginationResult;
                });

            return Result<PaginationResult<MentorWithCoursesResponse>>.Success(result);
        }
        catch (Exception ex)
        {
            var error = new Error("MentorServices.GetAllMentorsWithCourses", ex.Message);
            return Result.Failure(error);
        }
    }

    public async Task<Result> GetTopMentorCourses(int courseNumber = 5)
    {
        if (courseNumber <= 0)
        {
            return Result.Failure(400, MentorDashboardErrors.CourseNumberMustBeLargerThanZero);
        }

        var userId = _executionContext.GetUserId();
        var cacheKey = CacheKeys.MentorTopCourses(userId, courseNumber);
        
        var result = await _cacheService.GetOrSetDashboardAsync(
            cacheKey,
            async () =>
            {
                var coursesQuery = _courseRepository.GetQueryable()
                    .Where(c => c.MentorId == userId);

                var courses = await _courseRepository
                    .ToListAsync(coursesQuery, nameof(Course.CourseCategory), nameof(Course.MentoringSessions));

                var topCourses = courses.Select(c => c.ToResponse(c.MentoringSessions
                                                        .GroupBy(ms => ms.LearnerId)
                                                        .Count()))
                                        .OrderByDescending(c => c.LearnerCount)
                                        .Take(courseNumber)
                                        .ToList();
                return topCourses;
            });
        
        return Result<List<CourseResponse>>.Success(result);
    }

    public async Task<Result> GetUpcomingSessions(int sessionNumber = 5)
    {
        if (sessionNumber <= 0)
        {
            return Result.Failure(400, MentorDashboardErrors.UpcomingSessionNumberMustBeLargerThanZero);
        }

        var userId = _executionContext.GetUserId();

        var selectedSessions = await _sessionRepository.GetMentorUpcomingSessions(userId);
        var result = selectedSessions
            .Select(s => s.ToResponse())
            .OrderBy(s => s.Schedule.StartTime)
            .Take(sessionNumber)
            .ToList();
        return Result<List<SessionResponse>>.Success(result);
    }

    public async Task<Result> GetNotifications(int notificationNumber = 5)
    {
        if (notificationNumber <= 0)
        {
            return Result.Failure(400, MentorDashboardErrors.NotificationNumberMustBeLargerThanZero);
        }

        var userId = _executionContext.GetUserId();

        var notificationsQuery = _notificationRepository.GetQueryable()
            .Where(n => n.OwnerId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .Take(notificationNumber);
        var notifications = await _notificationRepository.ToListAsync(notificationsQuery);

        return Result<List<NotificationResponse>>.Success(notifications.Select(n => n.ToResponse()).ToList());
    }
}