using MentorPlatform.Application.Commons.CommandMessages;
using MentorPlatform.Application.Commons.Errors;
using MentorPlatform.Application.Commons.Mappings;
using MentorPlatform.Application.Commons.Models.Lookup;
using MentorPlatform.Application.Commons.Models.Requests.CourseRequests;
using MentorPlatform.Application.Commons.Models.Responses.CourseResponses;
using MentorPlatform.Application.Identity;
using MentorPlatform.Application.Services.Caching;
using MentorPlatform.Application.Services.Messaging;
using MentorPlatform.Domain.Entities;
using MentorPlatform.Domain.Enums;
using MentorPlatform.Domain.Events;
using MentorPlatform.Domain.Repositories;
using MentorPlatform.Domain.Shared;
using Microsoft.Extensions.Logging;

namespace MentorPlatform.Application.UseCases.CourseUseCases;

public class CourseServices : ICourseServices
{
    private readonly ICourseRepository _courseRepository;
    private readonly IExecutionContext _executionContext;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IRepository<User, Guid> _userRepository;
    private readonly ICourseCategoryRepository _courseCategoryRepository;
    private readonly ICacheService _cache;
    private readonly IDomainEventDispatcher _eventDispatcher;
    private readonly ILogger<CourseServices> _logger;

    public CourseServices(
        ICourseRepository courseRepository,
        IExecutionContext executionContext,
        IUnitOfWork unitOfWork,
        IRepository<User, Guid> userRepository,
        ICourseCategoryRepository courseCategoryRepository,
        ICacheService cache,
        IDomainEventDispatcher eventDispatcher,
        ILogger<CourseServices> logger)
    {
        _courseRepository = courseRepository;
        _executionContext = executionContext;
        _unitOfWork = unitOfWork;
        _userRepository = userRepository;
        _courseCategoryRepository = courseCategoryRepository;
        _cache = cache;
        _eventDispatcher = eventDispatcher;
        _logger = logger;
    }

    public async Task<Result> AddCourseAsync(CreateCourseRequest courseRequest)
    {
        var userId = _executionContext.GetUserId();
        var user = await _userRepository.GetByIdAsync(userId, nameof(User.Resources));

        if (user == null)
        {
            return Result.Failure(403, UserErrors.UserNotExists);
        }

        var selectedCategory = await _courseCategoryRepository.GetByIdAsync(courseRequest.CourseCategoryId);
        if (selectedCategory == null)
        {
            return Result.Failure(400, CourseErrors.CourseCategoryNotExists);
        }

        if (!selectedCategory.IsActive)
        {
            return Result.Failure(409, CourseErrors.CourseCategoryNotExists);
        }

        var newCourse = courseRequest.ToEntity();
        newCourse.MentorId = userId;
        if (courseRequest.ResourceIds.Count > 0)
        {
            newCourse.CourseResources = [];
            foreach (var resourceRequestId in courseRequest.ResourceIds)
            {
                if (!(user.Resources?.Any(r => r.Id.Equals(resourceRequestId)) ?? false))
                {
                    return Result.Failure(ResourceErrors.ResourceNotBelongToUser);
                }
                var courseResource = new CourseResource()
                {
                    ResourceId = resourceRequestId,
                };
                newCourse.CourseResources.Add(courseResource);
            }
        }

        _courseRepository.Add(newCourse);
        await _unitOfWork.SaveChangesAsync();

        // Invalidate course caches
        await _cache.RemoveAsync(CacheKeys.CoursesByMentor(userId));
        await _cache.RemoveAsync(CacheKeys.CoursesByCategory(courseRequest.CourseCategoryId));

        Course? createdCourse = await _courseRepository.GetByIdAsync(newCourse.Id, nameof(Course.CourseCategory));

        CourseDetailsResponse response = new CourseDetailsResponse()
        {
            Id = createdCourse!.Id,
            Title = createdCourse!.Title,
            LearnerCount = 0,
            Description = createdCourse!.Description,
            Category = new CourseDetailsCategoryResponse()
            {
                Name = createdCourse!.CourseCategory!.Name,
                Id = createdCourse!.CourseCategory!.Id
            },
            Level = createdCourse!.Level
        };

        return Result<CourseDetailsResponse>.Success(response);
    }

    public async Task<Result> UpdateCourseAsync(Guid courseId, EditCourseRequest courseRequest)
    {
        var userId = _executionContext.GetUserId();
        var user = await _userRepository.GetByIdAsync(userId, nameof(User.Resources));

        if (user == null)
        {
            return Result.Failure(403, UserErrors.UserNotExists);
        }

        var selectedCourse =
            await _courseRepository.GetByIdAsync(courseId, nameof(Course.CourseResources), nameof(Course.CourseCategory));
        if (selectedCourse == null)
        {
            return Result.Failure(400, CourseErrors.CourseNotExists);
        }
        if (selectedCourse.MentorId != userId)
        {
            return Result.Failure(403, CourseErrors.MentorCanNotEditCourse);
        }

        var selectedCategory = await _courseCategoryRepository.GetByIdAsync(courseRequest.CourseCategoryId);
        if (selectedCategory == null)
        {
            return Result.Failure(400, CourseErrors.CourseCategoryNotExists);
        }

        if (!selectedCategory.IsActive)
        {
            return Result.Failure(409, CourseErrors.CourseCategoryNotExists);
        }

        selectedCourse.Title = courseRequest.Title.Trim();
        selectedCourse.Description = courseRequest.Description.Trim();
        selectedCourse.Level = courseRequest.Level;
        selectedCourse.CourseCategoryId = courseRequest.CourseCategoryId;

        selectedCourse.CourseResources = [];
        foreach (var resourceId in courseRequest.ResourceIds)
        {
            if (!(user.Resources?.Any(r => r.Id.Equals(resourceId)) ?? false))
            {
                return Result.Failure(ResourceErrors.ResourceNotBelongToUser);
            }
            selectedCourse.CourseResources.Add(new CourseResource { ResourceId = resourceId });
        }

        _courseRepository.Update(selectedCourse);
        await _unitOfWork.SaveChangesAsync();

        // Invalidate course caches
        await _cache.RemoveAsync(CacheKeys.Course(courseId));
        await _cache.RemoveAsync(CacheKeys.CoursesByMentor(userId));
        await _cache.RemoveAsync(CacheKeys.CoursesByCategory(courseRequest.CourseCategoryId));
        if (selectedCourse.CourseCategoryId != courseRequest.CourseCategoryId)
        {
            await _cache.RemoveAsync(CacheKeys.CoursesByCategory(selectedCourse.CourseCategoryId));
        }

        return Result<string>.Success(CourseCommandMessages.UpdateSuccessfully);
    }

    public async Task<Result> DeleteCourseAsync(Guid courseId)
    {
        var userId = _executionContext.GetUserId();

        var selectedCourse = await _courseRepository.GetByIdAsync(courseId, nameof(Course.MentoringSessions), nameof(Course.CourseResources));

        if (selectedCourse == null)
        {
            return Result.Failure(400, CourseErrors.CourseNotExists);
        }

        if (selectedCourse.MentorId != userId)
        {
            return Result.Failure(403, CourseErrors.MentorCanNotDeleteCourse);
        }

        if (selectedCourse.MentoringSessions != null && selectedCourse.MentoringSessions.Count > 0)
        {
            return Result.Failure(409, CourseErrors.CourseHasMentoringSession);
        }

        _courseRepository.Remove(selectedCourse);
        await _unitOfWork.SaveChangesAsync();

        // Invalidate course caches
        await _cache.RemoveAsync(CacheKeys.Course(courseId));
        await _cache.RemoveAsync(CacheKeys.CoursesByMentor(userId));
        await _cache.RemoveAsync(CacheKeys.CoursesByCategory(selectedCourse.CourseCategoryId));

        return Result<string>.Success(CourseCommandMessages.DeleteSuccessfully);
    }

    public async Task<Result> GetAllAsync(CourseQueryParameters queryParameters)
    {
        var userId = _executionContext.GetUserId();
        var selectedUser = await _userRepository.GetByIdAsync(userId);

        var searchValue = queryParameters?.Search?.Trim();
        var queryFilter = _courseRepository.GetQueryable()
                        .Where(x => x.Mentor.IsActive
                                    && (queryParameters == null ||
                                        (string.IsNullOrEmpty(searchValue) || x.Title.Contains(searchValue) || x.Description.Contains(searchValue))
                                        && (queryParameters!.CategoryId == null || x.CourseCategoryId == queryParameters.CategoryId)
                                        && (queryParameters.Level == null || x.Level == queryParameters.Level)
                                        && (selectedUser!.Role != Role.Learner || (queryParameters.MentorId == null || x.MentorId == queryParameters.MentorId))
                                     ));

        if (selectedUser!.Role == Role.Mentor)
        {
            queryFilter = queryFilter.Where(x => x.MentorId == userId);
        }
        var queryPagination = queryFilter
                            .Skip((queryParameters!.PageNumber - 1) * queryParameters.PageSize)
                            .Take(queryParameters.PageSize)
                            .Select(x => new CourseDetailsResponse()
                            {
                                Id = x.Id,
                                Title = x.Title,
                                Description = x.Description,
                                LearnerCount = x.MentoringSessions != null ? x.MentoringSessions.GroupBy(s => s.LearnerId).Count() : 0,
                                Category = new CourseDetailsCategoryResponse()
                                {
                                    Id = x.CourseCategory.Id,
                                    Name = x.CourseCategory.Name
                                },
                                Level = x.Level,
                                Mentor = new MentorInfoForCourseResponse()
                                {
                                    Id = x.MentorId,
                                    FullName = x.Mentor.UserDetail.FullName,
                                    AvatarUrl = x.Mentor.UserDetail.AvatarUrl,
                                    Experience = x.Mentor.UserDetail.Experience
                                }
                            });
        var res = PaginationResult<CourseDetailsResponse>.Create(data: await _courseRepository.ToListAsync(queryPagination),
                                                                  totalCount: await _courseRepository.CountAsync(queryFilter),
                                                                  pageNumber: queryParameters.PageNumber,
                                                                  pageSize: queryParameters.PageSize);

        return Result<PaginationResult<CourseDetailsResponse>>.Success(res);
    }

    public async Task<Result> GetAllForLearnerAsync(CourseQueryParameters queryParameters)
    {
        var userId = _executionContext.GetUserId();
        var selectedUser = await _userRepository.GetByIdAsync(userId);

        if (selectedUser!.Role != Role.Learner)
        {
            return Result.Failure(403, CourseErrors.NotALearner);
        }

        var searchValue = queryParameters?.Search?.Trim();
        var queryFilter = _courseRepository.GetQueryable()
                        .Where(x => x.MentoringSessions != null &&
                                    x.MentoringSessions.Any(ms => ms.LearnerId == userId &&
                                                                (ms.RequestStatus == RequestMentoringSessionStatus.Scheduled ||
                                                                ms.RequestStatus == RequestMentoringSessionStatus.Completed)))
                        .Where(x => queryParameters == null ||
                                    (string.IsNullOrEmpty(searchValue) || x.Title.Contains(searchValue) || x.Description.Contains(searchValue))
                                    && (queryParameters!.CategoryId == null || x.CourseCategoryId == queryParameters.CategoryId)
                                    && (queryParameters.Level == null || x.Level == queryParameters.Level)
                                    && (queryParameters.MentorId == null || x.MentorId == queryParameters.MentorId));

        var queryPagination = queryFilter
                            .Skip((queryParameters!.PageNumber - 1) * queryParameters.PageSize)
                            .Take(queryParameters.PageSize)
                            .Select(x => new CourseDetailsResponse()
                            {
                                Id = x.Id,
                                Title = x.Title,
                                Description = x.Description,
                                LearnerCount = x.MentoringSessions != null ? x.MentoringSessions.GroupBy(s => s.LearnerId).Count() : 0,
                                Category = new CourseDetailsCategoryResponse()
                                {
                                    Id = x.CourseCategory.Id,
                                    Name = x.CourseCategory.Name
                                },
                                Level = x.Level,
                                Mentor = new MentorInfoForCourseResponse()
                                {
                                    Id = x.MentorId,
                                    FullName = x.Mentor.UserDetail.FullName,
                                    AvatarUrl = x.Mentor.UserDetail.AvatarUrl,
                                    Experience = x.Mentor.UserDetail.Experience
                                }
                            });
        var res = PaginationResult<CourseDetailsResponse>.Create(data: await _courseRepository.ToListAsync(queryPagination),
                                                                  totalCount: await _courseRepository.CountAsync(queryFilter),
                                                                  pageNumber: queryParameters.PageNumber,
                                                                  pageSize: queryParameters.PageSize);

        return Result<PaginationResult<CourseDetailsResponse>>.Success(res);
    }

    public async Task<Result> GetByIdAsync(Guid id)
    {
        var userId = _executionContext.GetUserId();
        var selectedUser = await _userRepository.GetByIdAsync(userId);
        var selectedCourse = await _courseRepository.GetByIdAsync(id);
        if (selectedCourse == null)
        {
            return Result.Failure(404, CourseErrors.CourseNotExists);
        }
        if (selectedUser!.Role == Role.Mentor && selectedCourse.MentorId != userId)
        {
            return Result.Failure(403, CourseErrors.MentorCanNotViewCourse);
        }
        var hasMentorAccess = selectedUser.Role == Role.Mentor;
        var query = _courseRepository.GetQueryable()
             .Where(x => x.Id == id && x.Mentor.IsActive)
             .Select(x => new CourseDetailsResponse
             {
                 Id = x.Id,
                 Title = x.Title,
                 Description = x.Description,
                 LearnerCount = x.MentoringSessions != null ? x.MentoringSessions
                     .Where(ms => ms.RequestStatus == RequestMentoringSessionStatus.Scheduled || ms.RequestStatus == RequestMentoringSessionStatus.Completed)
                     .Select(ms => ms.LearnerId)
                     .Distinct()
                     .Count() : 0,

                 Category = new CourseDetailsCategoryResponse
                 {
                     Id = x.CourseCategory.Id,
                     Name = x.CourseCategory.Name
                 },

                 Level = x.Level,

                 Mentor = new MentorInfoForCourseResponse
                 {
                     Id = x.MentorId,
                     FullName = x.Mentor.UserDetail.FullName,
                     AvatarUrl = x.Mentor.UserDetail.AvatarUrl,
                     Experience = x.Mentor.UserDetail.Experience,
                     Email = x.Mentor.Email,
                     Expertises = x.Mentor.UserExpertises != null
                                    ? x.Mentor.UserExpertises.Select(ue => new LookupModel
                                    {
                                        Id = ue.ExpertiseId,
                                        Name = ue.Expertise.Name
                                    }).ToList()
                                    : new List<LookupModel>()
                 },

                 HasAccessResourcePermission = hasMentorAccess ||
                     (x.MentoringSessions != null &&
                         x.MentoringSessions.Any(ms => (ms.RequestStatus == RequestMentoringSessionStatus.Scheduled || ms.RequestStatus == RequestMentoringSessionStatus.Completed)
                                    && ms.LearnerId == userId)),

                 Resources = (hasMentorAccess ||
                     (x.MentoringSessions != null &&
                         x.MentoringSessions.Any(ms => (ms.RequestStatus == RequestMentoringSessionStatus.Scheduled || ms.RequestStatus == RequestMentoringSessionStatus.Completed)
                                    && ms.LearnerId == userId)))
                     ? (x.CourseResources != null
                            ? x.CourseResources.Select(r => new ResourceResponse
                            {
                                Id = r.ResourceId,
                                Title = r.Resource.Title,
                                Description = r.Resource.Description,
                                FilePath = r.Resource.FilePath,
                                FileType = r.Resource.FileType
                            }).ToList()
                            : new List<ResourceResponse>())
                     : new List<ResourceResponse>()
             });

        var res = await _courseRepository.FirstOrDefaultAsync(query);

        return Result<CourseDetailsResponse>.Success(res!);
    }

    public async Task<Result> GetLookupAsync(string? search)
    {
        User user = _executionContext.GetUser()!;

        var searchValue = search?.Trim();
        var query = _courseRepository.GetQueryable()
                            .Where(x => (string.IsNullOrEmpty(searchValue) || x.Title.Contains(searchValue)) &&
                                        ((user.Role == Role.Mentor && x.MentorId == user.Id) ||
                                        (user.Role == Role.Learner && x.MentoringSessions != null && x.MentoringSessions.Any(ms => ms.LearnerId == user.Id))))
                            .Select(x => new LookupModel()
                            {
                                Id = x.Id,
                                Name = x.Title
                            });
        if (string.IsNullOrEmpty(searchValue))
        {
            query = query.Take(6);
        }
        var res = await _courseRepository.ToListAsync(query);
        return Result<List<LookupModel>>.Success(res);
    }
}