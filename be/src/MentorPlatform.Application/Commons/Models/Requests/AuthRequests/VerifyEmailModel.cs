
using FluentValidation;
using MentorPlatform.Application.Commons.ValidationMessages;
using MentorPlatform.Domain.Constants;

namespace MentorPlatform.Application.Commons.Models.Requests.AuthRequests;



public class VerifyEmailModel
{
    public string Email { get; set; } = default;
    public string Code { get; set; } = default;
}


public class VerifyEmailModalValidator : AbstractValidator<VerifyEmailModel>
{
    public VerifyEmailModalValidator()
    {
        RuleFor(u => u.Email)
            .NotEmpty()
            .WithMessage(AuthModelsValidationMessages.FormatEmailInvalid)
            .Matches(UserConstants.EmailRegexPattern)
            .WithMessage(AuthModelsValidationMessages.FormatEmailInvalid);
        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Code is required.")
            .Matches(@"^\d{6}$")
            .WithMessage("Code must consist of exactly 6 digits.");
    }
}

