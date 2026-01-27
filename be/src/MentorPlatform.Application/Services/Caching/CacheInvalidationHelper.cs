namespace MentorPlatform.Application.Services.Caching;

/// <summary>
/// Helper class for common cache invalidation patterns
/// </summary>
public class CacheInvalidationHelper
{
    private readonly ICacheService _cacheService;

    public CacheInvalidationHelper(ICacheService cacheService)
    {
        _cacheService = cacheService;
    }

    /// <summary>
    /// Invalidate resource-related caches
    /// </summary>
    public async Task InvalidateResourceCachesAsync(Guid resourceId, Guid mentorId)
    {
        await Task.WhenAll(
            _cacheService.RemoveAsync(CacheKeys.Resource(resourceId)),
            _cacheService.RemoveByPrefixAsync(CacheKeys.ResourcesByMentor(mentorId))
        );
    }

    /// <summary>
    /// Invalidate schedule-related caches
    /// </summary>
    public async Task InvalidateScheduleCachesAsync(Guid scheduleId, Guid mentorId)
    {
        await Task.WhenAll(
            _cacheService.RemoveAsync(CacheKeys.Schedule(scheduleId)),
            _cacheService.RemoveByPrefixAsync(CacheKeys.SchedulesByMentor(mentorId)),
            _cacheService.RemoveByPrefixAsync(CacheKeys.AvailableSchedules(mentorId))
        );
    }

    /// <summary>
    /// Invalidate session-related caches
    /// </summary>
    public async Task InvalidateSessionCachesAsync(Guid sessionId, Guid mentorId, Guid learnerId)
    {
        await Task.WhenAll(
            _cacheService.RemoveAsync(CacheKeys.Session(sessionId)),
            _cacheService.RemoveByPrefixAsync(CacheKeys.SessionsByMentor(mentorId)),
            _cacheService.RemoveByPrefixAsync(CacheKeys.SessionsByLearner(learnerId))
        );
    }

    /// <summary>
    /// Invalidate session and related schedule caches
    /// </summary>
    public async Task InvalidateSessionAndScheduleCachesAsync(Guid sessionId, Guid scheduleId, Guid mentorId, Guid learnerId)
    {
        await Task.WhenAll(
            _cacheService.RemoveAsync(CacheKeys.Session(sessionId)),
            _cacheService.RemoveAsync(CacheKeys.Schedule(scheduleId)),
            _cacheService.RemoveByPrefixAsync(CacheKeys.SessionsByMentor(mentorId)),
            _cacheService.RemoveByPrefixAsync(CacheKeys.SessionsByLearner(learnerId)),
            _cacheService.RemoveByPrefixAsync(CacheKeys.SchedulesByMentor(mentorId)),
            _cacheService.RemoveByPrefixAsync(CacheKeys.AvailableSchedules(mentorId))
        );
    }

    /// <summary>
    /// Invalidate course-related caches
    /// </summary>
    public async Task InvalidateCourseCachesAsync(Guid courseId, Guid mentorId, Guid categoryId)
    {
        await Task.WhenAll(
            _cacheService.RemoveAsync(CacheKeys.Course(courseId)),
            _cacheService.RemoveAsync(CacheKeys.CoursesByMentor(mentorId)),
            _cacheService.RemoveAsync(CacheKeys.CoursesByCategory(categoryId))
        );
    }

    /// <summary>
    /// Invalidate course caches with category change
    /// </summary>
    public async Task InvalidateCourseCachesAsync(Guid courseId, Guid mentorId, Guid oldCategoryId, Guid newCategoryId)
    {
        var tasks = new List<Task>
        {
            _cacheService.RemoveAsync(CacheKeys.Course(courseId)),
            _cacheService.RemoveAsync(CacheKeys.CoursesByMentor(mentorId)),
            _cacheService.RemoveAsync(CacheKeys.CoursesByCategory(oldCategoryId))
        };

        if (oldCategoryId != newCategoryId)
        {
            tasks.Add(_cacheService.RemoveAsync(CacheKeys.CoursesByCategory(newCategoryId)));
        }

        await Task.WhenAll(tasks);
    }

    /// <summary>
    /// Invalidate category-related caches
    /// </summary>
    public async Task InvalidateCategoryCachesAsync(Guid categoryId)
    {
        await Task.WhenAll(
            _cacheService.RemoveAsync(CacheKeys.CourseCategory(categoryId)),
            _cacheService.RemoveAsync(CacheKeys.CourseCategoriesLookup),
            _cacheService.RemoveByPrefixAsync(CacheKeys.CategoriesPrefix)
        );
    }

    /// <summary>
    /// Invalidate user-related caches
    /// </summary>
    public async Task InvalidateUserCachesAsync(Guid userId)
    {
        await Task.WhenAll(
            _cacheService.RemoveAsync(CacheKeys.User(userId)),
            _cacheService.RemoveByPrefixAsync(CacheKeys.UsersPrefix)
        );
    }
}
