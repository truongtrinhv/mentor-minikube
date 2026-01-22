using MentorPlatform.Application.Commons.Models.Requests.AuthRequests;
using MentorPlatform.Application.Commons.Models.Responses.AuthResponses;
using MentorPlatform.Domain.Shared;

namespace MentorPlatform.Application.UseCases.Authentication;

public interface IAuthServices
{
    Task<Result<LoginResponse>> LoginAsync(LoginRequest loginRequest);
    Task<Result> RegisterAsync(RegisterRequest registerRequest);
    Task<Result<string>> LogoutAsync();
    Task<Result> ForgotPasswordAsync(ForgotPasswordRequest  forgotPasswordRequest);
    Task<Result> VerifyEmailAsync(VerifyEmailModel verifyEmailModel);
    Task<Result> ResendVerifyEmailAsync(ResendVerifyEmailRequest resendVerifyEmailRequest);
    Task<Result> RefreshTokenAsync(RefreshTokenRequest refreshTokenRequest);
    Task<Result> VerifyForgotPasswordAsync(VerifyForgotPasswordRequest  verifyForgotPasswordRequest);
    Task<Result> ResetPasswordAsync(ResetPasswordRequest resetPasswordRequest);
    Task<Result> ChangePasswordAsync(ChangePasswordRequest changePasswordRequest);
    Task<Result> GetCurrentUserAsync();
    Task<Result> GetCurrentUserDetailAsync();

    Task<Result> EditingProfileUserAsync(EditingUserProfileRequest editingUserProfileRequest);
}
