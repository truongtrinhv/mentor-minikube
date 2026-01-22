namespace MentorPlatform.Application.Commons.Models.Responses.AuthResponses;

public class LoginResponse
{
    public string AccessToken { get; set; } = default!;
    public string RefreshToken { get; set; } = default!;
    public bool IsVerifyEmail { get; set; } = true;
}
