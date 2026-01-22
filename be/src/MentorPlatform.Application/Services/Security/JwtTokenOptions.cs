namespace MentorPlatform.Application.Services.Security;

public class JwtTokenOptions
{
    public string PublicKey { get; set; } = default!;
    public string PrivateKey { get; set; } = default!;
    public string Issuer { get; set; } = default!;
    public string Audience { get; set; } = default!;
    public bool ValidateIssuer { get; set; }
    public bool ValidateAudience { get; set; }
    public bool RequireHttpsMetadata { get; set; }
    public int ExpireTokenMinutes { get; set; }
    public int ExpireRefreshTokenDays { get; set; }
}
