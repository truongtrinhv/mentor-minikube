namespace MentorPlatform.Application.Services.Caching;

/// <summary>
/// Extension methods for ICacheService to simplify common caching patterns
/// </summary>
public static class CacheServiceExtensions
{
    /// <summary>
    /// Cache with static data TTL configuration
    /// </summary>
    public static Task<T?> GetOrSetStaticAsync<T>(
        this ICacheService cache,
        string key,
        Func<Task<T>> factory,
        CancellationToken cancellationToken = default)
    {
        return cache.GetOrSetAsync(
            key,
            factory,
            CacheConfiguration.StaticData.AbsoluteExpiration,
            CacheConfiguration.StaticData.SlidingExpiration,
            cancellationToken);
    }

    /// <summary>
    /// Cache with lookup data TTL configuration
    /// </summary>
    public static Task<T?> GetOrSetLookupAsync<T>(
        this ICacheService cache,
        string key,
        Func<Task<T>> factory,
        CancellationToken cancellationToken = default)
    {
        return cache.GetOrSetAsync(
            key,
            factory,
            CacheConfiguration.LookupData.AbsoluteExpiration,
            CacheConfiguration.LookupData.SlidingExpiration,
            cancellationToken);
    }

    /// <summary>
    /// Cache with paginated data TTL configuration
    /// </summary>
    public static Task<T?> GetOrSetPaginatedAsync<T>(
        this ICacheService cache,
        string key,
        Func<Task<T>> factory,
        CancellationToken cancellationToken = default)
    {
        return cache.GetOrSetAsync(
            key,
            factory,
            CacheConfiguration.PaginatedData.AbsoluteExpiration,
            CacheConfiguration.PaginatedData.SlidingExpiration,
            cancellationToken);
    }

    /// <summary>
    /// Cache with entity data TTL configuration
    /// </summary>
    public static Task<T?> GetOrSetEntityAsync<T>(
        this ICacheService cache,
        string key,
        Func<Task<T>> factory,
        CancellationToken cancellationToken = default)
    {
        return cache.GetOrSetAsync(
            key,
            factory,
            CacheConfiguration.EntityData.AbsoluteExpiration,
            CacheConfiguration.EntityData.SlidingExpiration,
            cancellationToken);
    }

    /// <summary>
    /// Cache with dashboard data TTL configuration
    /// </summary>
    public static Task<T?> GetOrSetDashboardAsync<T>(
        this ICacheService cache,
        string key,
        Func<Task<T>> factory,
        CancellationToken cancellationToken = default)
    {
        return cache.GetOrSetAsync(
            key,
            factory,
            CacheConfiguration.DashboardData.AbsoluteExpiration,
            CacheConfiguration.DashboardData.SlidingExpiration,
            cancellationToken);
    }

    /// <summary>
    /// Cache with schedule data TTL configuration
    /// </summary>
    public static Task<T?> GetOrSetScheduleAsync<T>(
        this ICacheService cache,
        string key,
        Func<Task<T>> factory,
        CancellationToken cancellationToken = default)
    {
        return cache.GetOrSetAsync(
            key,
            factory,
            CacheConfiguration.ScheduleData.AbsoluteExpiration,
            CacheConfiguration.ScheduleData.SlidingExpiration,
            cancellationToken);
    }

    /// <summary>
    /// Cache with volatile data TTL configuration
    /// </summary>
    public static Task<T?> GetOrSetVolatileAsync<T>(
        this ICacheService cache,
        string key,
        Func<Task<T>> factory,
        CancellationToken cancellationToken = default)
    {
        return cache.GetOrSetAsync(
            key,
            factory,
            CacheConfiguration.VolatileData.AbsoluteExpiration,
            CacheConfiguration.VolatileData.SlidingExpiration,
            cancellationToken);
    }

    /// <summary>
    /// Cache with permission data TTL configuration
    /// </summary>
    public static Task<T?> GetOrSetPermissionAsync<T>(
        this ICacheService cache,
        string key,
        Func<Task<T>> factory,
        CancellationToken cancellationToken = default)
    {
        return cache.GetOrSetAsync(
            key,
            factory,
            CacheConfiguration.PermissionData.AbsoluteExpiration,
            CacheConfiguration.PermissionData.SlidingExpiration,
            cancellationToken);
    }
}
