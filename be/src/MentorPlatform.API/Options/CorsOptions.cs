namespace MentorPlatform.WebApi.Options;

public class CorsOptions
{
    public string PolicyName { get; set; } = default!;
    public string[] AllowedOrigins { get; set; } = default!;
    public bool AllowCredentials { get; set; }
}
