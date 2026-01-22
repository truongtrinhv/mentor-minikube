using MentorPlatform.Application.Commons.Models.Requests.AuthRequests;
using MentorPlatform.Application.UseCases.Authentication;
using MentorPlatform.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MentorPlatform.WebApi.Controllers;

[Route("api/auth")]
public class AuthsController : ApiControllerBase
{
    private readonly IAuthServices _authServices;

    public AuthsController(IAuthServices authServices)
    {
        _authServices = authServices;
    }

    [HttpGet("me")]
    [Authorize(Roles = $"{nameof(Role.Admin)},{nameof(Role.Learner)},{nameof(Role.Mentor)}")]
    public async Task<IActionResult> GetCurrentUserAsync()
    {
        var result = await _authServices.GetCurrentUserAsync();
        return ProcessResult(result);
    }

    [HttpGet("me/detail")]
    [Authorize(Roles = $"{nameof(Role.Learner)},{nameof(Role.Mentor)}")]
    public async Task<IActionResult> GetCurrentUserDetailAsync()
    {
        var result = await _authServices.GetCurrentUserDetailAsync();
        return ProcessResult(result);
    }

    [HttpPost("login")]
    public async Task<IActionResult> LoginAsync([FromBody] LoginRequest loginRequest)
    {
        var result = await _authServices.LoginAsync(loginRequest);

        return ProcessResult(result);
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPasswordAsync([FromBody] ForgotPasswordRequest loginRequest)
    {
        var result = await _authServices.ForgotPasswordAsync(loginRequest);

        return ProcessResult(result);
    }
    [HttpPost("verify-forgot-password")]
    public async Task<IActionResult> VerifyForgotPasswordAsync([FromBody] VerifyForgotPasswordRequest verifyForgotPasswordRequest)
    {
        var result = await _authServices.VerifyForgotPasswordAsync(verifyForgotPasswordRequest);

        return ProcessResult(result);
    }
    
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPasswordAsync([FromBody] ResetPasswordRequest resetPasswordRequest)
    {
        var result = await _authServices.ResetPasswordAsync(resetPasswordRequest);

        return ProcessResult(result);
    }
    
    [HttpPost("change-password")]
    [Authorize(Roles = $"{nameof(Role.Learner)},{nameof(Role.Mentor)}")]
    public async Task<IActionResult> ChangePasswordAsync([FromBody] ChangePasswordRequest changePasswordRequest)
    {
        var result = await _authServices.ChangePasswordAsync(changePasswordRequest);
        return ProcessResult(result);
    }
    
    [HttpPost("refresh-token")]
    public async Task<IActionResult> RefreshTokenAsync([FromBody] RefreshTokenRequest refresTokenRequest)
    {
        var result = await _authServices.RefreshTokenAsync(refresTokenRequest);

        return ProcessResult(result);
    }
    [HttpPost("verify-email")]
    public async Task<IActionResult> VerifyEmailAsync([FromBody] VerifyEmailModel verifyEmailModel)
    {
        var result = await _authServices.VerifyEmailAsync(verifyEmailModel);

        return ProcessResult(result);
    }
    [HttpPost("resend-verify-email")]
    public async Task<IActionResult> ResendVerifyEmailAsync([FromBody] ResendVerifyEmailRequest resendVerifyEmailRequest)
    {
        var result = await _authServices.ResendVerifyEmailAsync(resendVerifyEmailRequest);

        return ProcessResult(result);
    }
    [HttpPost("logout")]
    [Authorize(Roles = $"{nameof(Role.Admin)},{nameof(Role.Learner)},{nameof(Role.Mentor)}")]
    public async Task<IActionResult> LogoutAsync()
    {
        var result = await _authServices.LogoutAsync();

        return ProcessResult(result);
    }

    [HttpPost("register")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> RegisterAsync([FromForm] RegisterRequest registerRequest)
    {
        var result = await _authServices.RegisterAsync(registerRequest);

        return ProcessResult(result);
    }

    [HttpPost("me")]
    [Authorize(Roles = $"{nameof(Role.Learner)},{nameof(Role.Mentor)}")]
    public async Task<IActionResult> EditingProfileUserAsync(
        [FromForm] EditingUserProfileRequest editUserProfileRequest)
    {
        var result = await _authServices.EditingProfileUserAsync(editUserProfileRequest);

        return ProcessResult(result);
    }
}
