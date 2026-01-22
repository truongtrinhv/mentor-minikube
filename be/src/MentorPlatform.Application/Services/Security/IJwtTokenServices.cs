using MentorPlatform.Domain.Entities;
using System.Security.Claims;

namespace MentorPlatform.Application.Services.Security;

public interface IJwtTokenServices
{
    string GenerateAccessToken(User user, Guid refreshTokenId);
    string GenerateRefreshToken();

    ClaimsPrincipal ValidateAndDecode(string accessToken);
    void RecallAccessToken();
}
