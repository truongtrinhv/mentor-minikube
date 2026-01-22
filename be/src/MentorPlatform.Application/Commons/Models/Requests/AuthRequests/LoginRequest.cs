
using FluentValidation;
using MentorPlatform.Application.Commons.ValidationMessages;
using MentorPlatform.Domain.Constants;

namespace MentorPlatform.Application.Commons.Models.Requests.AuthRequests;

public class LoginRequest
{
    public string Email { get; set; } = default!;
    public string Password { get; set; } = default!;
}

public class LoginRequestValidator : AbstractValidator<LoginRequest>
{
    public LoginRequestValidator()
    {
        RuleFor(l => l.Email)
            .NotEmpty().WithMessage(AuthModelsValidationMessages.EmailNotEmpty)
            .Matches(UserConstants.EmailRegexPattern)
            .WithMessage(AuthModelsValidationMessages.FormatEmailInvalid);
        RuleFor(l => l.Password).NotEmpty()
            .WithMessage(AuthModelsValidationMessages.PasswordNotEmpty);
    }
}
