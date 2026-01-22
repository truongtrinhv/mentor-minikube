using FluentValidation;
using MentorPlatform.Application.Commons.Errors;

namespace MentorPlatform.Application.Commons.Models.Requests.MentoringSessionRequest;

public class RescheduleSessionRequest
{
    public Guid NewScheduleId { get; set; }
    public string Notes { get; set; } = string.Empty;
}

public class RescheduleSessionRequestValidator : AbstractValidator<RescheduleSessionRequest>
{
    public RescheduleSessionRequestValidator()
    {
        RuleFor(r => r.Notes.Trim())
            .NotEmpty().WithMessage(MentoringSessionErrorMessages.RescheduleNotesMustNotBeEmpty)
            .MaximumLength(200).WithMessage(MentoringSessionErrorMessages.RescheduleNotesTooLong);
    }
}