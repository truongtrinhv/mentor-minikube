namespace MentorPlatform.CrossCuttingConcerns.Options;

public class CacheTTLOptions
{
    public CacheTTLConfig StaticData { get; set; } = new();
    public CacheTTLConfig LookupData { get; set; } = new();
    public CacheTTLConfig PaginatedData { get; set; } = new();
    public CacheTTLConfig EntityData { get; set; } = new();
    public CacheTTLConfig DashboardData { get; set; } = new();
    public CacheTTLConfig ScheduleData { get; set; } = new();
    public CacheTTLConfig VolatileData { get; set; } = new();
    public CacheTTLConfig PermissionData { get; set; } = new();
}

public class CacheTTLConfig
{
    public int AbsoluteExpirationMinutes { get; set; }
    public int SlidingExpirationMinutes { get; set; }

    public TimeSpan AbsoluteExpiration => TimeSpan.FromMinutes(AbsoluteExpirationMinutes);
    public TimeSpan SlidingExpiration => TimeSpan.FromMinutes(SlidingExpirationMinutes);
}
