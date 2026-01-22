using FluentValidation;
using MentorPlatform.Application.Commons.ValidationMessages;
using MentorPlatform.Domain.Constants;

namespace MentorPlatform.Application.Commons.Models.Requests.AuthRequests;

public class ResetPasswordRequest
{
    public string Email { get; set; } = default!;
    public string Code { get; set; } = default!;
    public string NewPassword { get; set; } = default!;
}

public class ResetPasswordRequestValidator : AbstractValidator<ResetPasswordRequest>
{
    public ResetPasswordRequestValidator()
    {
        RuleFor(u => u.Email)
            .NotEmpty()
            .WithMessage(AuthModelsValidationMessages.FormatEmailInvalid)
            .Matches(UserConstants.EmailRegexPattern)
            .WithMessage(AuthModelsValidationMessages.FormatEmailInvalid);

        RuleFor(x => x.Code)
            .NotEmpty().WithMessage(AuthModelsValidationMessages.CodeNotEmpty)
            .Matches(UserConstants.CodeRegexPattern)
            .WithMessage(AuthModelsValidationMessages.FormatCodeInvalid);

        RuleFor(x => x.NewPassword)
            .NotEmpty()
            .WithMessage(AuthModelsValidationMessages.PasswordNotEmpty)
            .Matches(UserConstants.PasswordRegexPattern)
            .WithMessage(AuthModelsValidationMessages.FormatPasswordInvalid);
    }
}
