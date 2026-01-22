
namespace MentorPlatform.Application.Commons.Models.Responses.AuthResponses;

public class VerifyEmailResponse
{
    public string AccessToken { get; set; } = default!;
    public string RefreshToken { get; set; } = default!;
}
