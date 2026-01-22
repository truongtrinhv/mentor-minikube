using FluentValidation;
using MentorPlatform.Application.Commons.ValidationMessages;
using MentorPlatform.Domain.Constants;

namespace MentorPlatform.Application.Commons.Models.Requests.AuthRequests;

public class ChangePasswordRequest
{
    public string CurrentPassword { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string ConfirmPassword { get; set; } = string.Empty;
}

public class ChangePasswordRequestValidator : AbstractValidator<ChangePasswordRequest>
{
    public ChangePasswordRequestValidator()
    {
        RuleFor(x => x.CurrentPassword)
            .NotEmpty()
            .WithMessage(AuthModelsValidationMessages.PasswordNotEmpty);

        RuleFor(x => x.Password)
            .NotEmpty()
            .WithMessage(AuthModelsValidationMessages.PasswordNotEmpty)
            .Matches(UserConstants.PasswordRegexPattern)
            .WithMessage(AuthModelsValidationMessages.FormatPasswordInvalid);

        RuleFor(x => x.ConfirmPassword)
            .NotEmpty()
            .WithMessage("Confirm password is required")
            .Equal(x => x.Password)
            .WithMessage("Password and confirmation password do not match");
    }
} 