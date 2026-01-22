using FluentValidation;
using MentorPlatform.Application.Commons.Errors;

namespace MentorPlatform.Application.Commons.Models.Requests.ScheduleRequests;
public class CreateScheduleRequest
{
    public List<TimeBlock> TimeBlocks { get; set; }
    public bool IsRepeating { get; set; }
    public int RepeatingWeeks { get; set; }
}

public class CreateScheduleRequestValidator : AbstractValidator<CreateScheduleRequest>
{
    public CreateScheduleRequestValidator()
    {
        RuleFor(x => x.TimeBlocks)
            .Must(x => x.Any())
            .WithMessage(ScheduleErrorMessages.TimeBlockRequired)
            .Must(x => IsInAWeek(x));
        RuleForEach(x => x.TimeBlocks)
            .NotNull()
            .WithMessage(ScheduleErrorMessages.TimeBlockRequired)
            .SetValidator(new TimeBlockValidator());
        RuleFor(x => x.IsRepeating)
            .NotNull()
            .WithMessage(ScheduleErrorMessages.IsRepeatingRequired);
        RuleFor(x => x.RepeatingWeeks)
            .Must((request, rw) => request.IsRepeating ? rw > 0 : true)
            .WithMessage(ScheduleErrorMessages.RepeatingWeeksGreaterThanZero)
            .Must((request, rw) => request.IsRepeating ? rw <= 52 : true)
            .WithMessage(ScheduleErrorMessages.RepeatingWeeksLessThanFiftyThree);
    }

    private static bool IsInAWeek(List<TimeBlock> dates)
    {
        return dates.MaxBy(date => date.EndTime).EndTime - dates.MinBy(date => date.StartTime).StartTime <= TimeSpan.FromDays(7);
    }
}