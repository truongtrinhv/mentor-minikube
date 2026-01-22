using FluentValidation;
using MentorPlatform.Application.Commons.Errors;

namespace MentorPlatform.Application.Commons.Models.Requests.ScheduleRequests;
public class EditScheduleRequest
{
    public TimeBlock TimeBlock { get; set; }
}

public class EditSchesuleRequestValidator : AbstractValidator<EditScheduleRequest>
{
    public EditSchesuleRequestValidator()
    {
        RuleFor(x => x.TimeBlock)
            .NotNull().WithMessage(ScheduleErrorMessages.TimeBlockRequired)
            .SetValidator(new TimeBlockValidator());
    }
}
