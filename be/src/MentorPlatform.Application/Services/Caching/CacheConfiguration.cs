using MentorPlatform.CrossCuttingConcerns.Options;
using Microsoft.Extensions.Options;

namespace MentorPlatform.Application.Services.Caching;

/// <summary>
/// Centralized cache configuration for TTL values (reads from CacheTTLOptions)
/// </summary>
public class CacheConfiguration
{
    private static CacheTTLOptions? _options;

    public static void Initialize(IOptions<CacheTTLOptions> options)
    {
        _options = options.Value;
    }

    private static CacheTTLOptions Options => _options ?? throw new InvalidOperationException("CacheConfiguration not initialized. Call Initialize() first.");

    /// <summary>
    /// Static reference data (rarely changes)
    /// </summary>
    public static class StaticData
    {
        public static TimeSpan AbsoluteExpiration => Options.StaticData.AbsoluteExpiration;
        public static TimeSpan SlidingExpiration => Options.StaticData.SlidingExpiration;
    }

    /// <summary>
    /// Lookup/dropdown data
    /// </summary>
    public static class LookupData
    {
        public static TimeSpan AbsoluteExpiration => Options.LookupData.AbsoluteExpiration;
        public static TimeSpan SlidingExpiration => Options.LookupData.SlidingExpiration;
    }

    /// <summary>
    /// Paginated lists with moderate change frequency
    /// </summary>
    public static class PaginatedData
    {
        public static TimeSpan AbsoluteExpiration => Options.PaginatedData.AbsoluteExpiration;
        public static TimeSpan SlidingExpiration => Options.PaginatedData.SlidingExpiration;
    }

    /// <summary>
    /// Individual entity details
    /// </summary>
    public static class EntityData
    {
        public static TimeSpan AbsoluteExpiration => Options.EntityData.AbsoluteExpiration;
        public static TimeSpan SlidingExpiration => Options.EntityData.SlidingExpiration;
    }

    /// <summary>
    /// Dashboard and aggregated statistics
    /// </summary>
    public static class DashboardData
    {
        public static TimeSpan AbsoluteExpiration => Options.DashboardData.AbsoluteExpiration;
        public static TimeSpan SlidingExpiration => Options.DashboardData.SlidingExpiration;
    }

    /// <summary>
    /// Schedule availability data
    /// </summary>
    public static class ScheduleData
    {
        public static TimeSpan AbsoluteExpiration => Options.ScheduleData.AbsoluteExpiration;
        public static TimeSpan SlidingExpiration => Options.ScheduleData.SlidingExpiration;
    }

    /// <summary>
    /// Real-time data with high volatility
    /// </summary>
    public static class VolatileData
    {
        public static TimeSpan AbsoluteExpiration => Options.VolatileData.AbsoluteExpiration;
        public static TimeSpan SlidingExpiration => Options.VolatileData.SlidingExpiration;
    }

    /// <summary>
    /// Permission and access control data
    /// </summary>
    public static class PermissionData
    {
        public static TimeSpan AbsoluteExpiration => Options.PermissionData.AbsoluteExpiration;
        public static TimeSpan SlidingExpiration => Options.PermissionData.SlidingExpiration;
    }
}
