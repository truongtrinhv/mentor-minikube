using FluentValidation;
using MentorPlatform.Application.Commons.Errors;

namespace MentorPlatform.Application.Commons.Models.Requests.ScheduleRequests;
public class TimeBlock
{
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }

    public TimeBlock(DateTime startTime, DateTime endTime)
    {
        StartTime = startTime;
        EndTime = endTime;
    }

    public bool IsConflictedWith(TimeBlock other)
    {
        return (StartTime < other.EndTime && StartTime >= other.StartTime)
            || (EndTime <= other.EndTime && EndTime > other.StartTime)
            || (StartTime <= other.StartTime && EndTime >= other.EndTime);
    }
}

public class TimeBlockValidator : AbstractValidator<TimeBlock>
{
    public TimeBlockValidator()
    {
        RuleFor(x => x.StartTime)
            .NotNull()
            .WithMessage(ScheduleErrorMessages.StartTimeRequired)
            .Must(time => time >= DateTime.UtcNow)
            .WithMessage(ScheduleErrorMessages.NotAValidTime)
            .Must(time => time <= DateTime.UtcNow.AddDays(7 * 52))
            .WithMessage(ScheduleErrorMessages.NotAValidTime);

        RuleFor(x => x.EndTime)
            .NotNull()
            .WithMessage(ScheduleErrorMessages.EndTimeRequired)
            .Must((timeBlock, endTime) => endTime >= timeBlock.StartTime.AddMinutes(30))
            .WithMessage(ScheduleErrorMessages.EndTimeMustBeGreaterThanStartTime)
            .Must((timeBlock, endTime) => endTime <= timeBlock.StartTime.AddHours(18))
            .WithMessage(ScheduleErrorMessages.NotAValidTime);
    }
}