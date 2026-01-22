
using FluentValidation;
using MentorPlatform.Application.Commons.ValidationMessages;

namespace MentorPlatform.Application.Commons.Models.Requests.AuthRequests;

public class RefreshTokenRequest
{
    public string AccessToken { get; set; } = default!;
    public string RefreshToken { get; set; } = default!;
}

public class RefreshTokenRequestValidator : AbstractValidator<RefreshTokenRequest>
{
    public RefreshTokenRequestValidator()
    {
        RuleFor(x => x.AccessToken)
            .NotEmpty().WithMessage(AuthModelsValidationMessages.AccessTokenRequired);

        RuleFor(x => x.RefreshToken)
            .NotEmpty().WithMessage(AuthModelsValidationMessages.RefreshTokenRequired);
    }
}