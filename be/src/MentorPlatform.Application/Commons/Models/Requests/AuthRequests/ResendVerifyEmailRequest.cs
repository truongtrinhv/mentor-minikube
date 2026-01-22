
using FluentValidation;
using MentorPlatform.Application.Commons.ValidationMessages;
using MentorPlatform.Domain.Constants;

namespace MentorPlatform.Application.Commons.Models.Requests.AuthRequests;

public class ResendVerifyEmailRequest
{
    public string Email { get; set; } = default!;
}

public class ResendVerifyEmailRequestValidator : AbstractValidator<ResendVerifyEmailRequest>
{
    public ResendVerifyEmailRequestValidator()
    {
        RuleFor(l => l.Email)
            .NotEmpty()
            .WithMessage(AuthModelsValidationMessages.FormatEmailInvalid)
            .Matches(UserConstants.EmailRegexPattern)
            .WithMessage(AuthModelsValidationMessages.FormatEmailInvalid);
    }
}