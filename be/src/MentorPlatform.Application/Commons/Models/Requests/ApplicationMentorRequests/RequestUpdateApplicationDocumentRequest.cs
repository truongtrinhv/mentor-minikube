using FluentValidation;
using MentorPlatform.Application.Commons.ValidationMessages;
using MentorPlatform.Domain.Constants;

namespace MentorPlatform.Application.Commons.Models.Requests.ApplicationMentorRequests;

public class RequestUpdateApplicationDocumentRequest
{
    public Guid Id { get; set; }
    public string Note { get; set; } = default!;
}



public class RequestUpdateApplicationDocumentRequestValidator : AbstractValidator<RequestUpdateApplicationDocumentRequest>
{
    public RequestUpdateApplicationDocumentRequestValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage(ApplicationRequestValidationMessages.ApplicationRequestIdMustBeNotEmpty);
        RuleFor(x => x.Note)
            .NotEmpty()
            .WithMessage(ApplicationRequestValidationMessages.NoteMustBeNotEmpty)
            .MaximumLength(ApplicationRequestConstants.MaxLengthNote)
            .WithMessage(ApplicationRequestValidationMessages.NoteMustBeLessThanOrEqualMaxLength);
    }
}