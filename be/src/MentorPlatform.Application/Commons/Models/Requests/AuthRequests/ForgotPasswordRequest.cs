
using FluentValidation;
using MentorPlatform.Application.Commons.ValidationMessages;
using MentorPlatform.Domain.Constants;

namespace MentorPlatform.Application.Commons.Models.Requests.AuthRequests;

public class ForgotPasswordRequest
{
    public string Email { get; set; } = default!;
}


public class ForgotPasswordRequestValidator : AbstractValidator<ForgotPasswordRequest>
{
    public ForgotPasswordRequestValidator()
    {
        RuleFor(u => u.Email)
            .NotEmpty()
            .WithMessage(AuthModelsValidationMessages.FormatEmailInvalid)
            .Matches(UserConstants.EmailRegexPattern)
            .WithMessage(AuthModelsValidationMessages.FormatEmailInvalid);
    }
}
