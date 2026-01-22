using MentorPlatform.Domain.Shared;

namespace MentorPlatform.Application.Commons.Errors;
public static class ScheduleErrorMessages
{
    public const string TimeBlockRequired = "Please select at least one date";
    public const string InvalidDateAvailable = "Selected dates and times must be in the future";
    public const string TimeConflict = "This time slot conflicts with an existing schedule";
    public const string DateAvailableMustBeInAWeek = "DateAvailable must be in a week";
    public const string IsRepeatingRequired = "IsRepeating is required";
    public const string RepeatingWeeksGreaterThanZero = "Repeating weeks must be greater than 0";
    public const string RepeatingWeeksLessThanFiftyThree = "Repeating weeks must be less than 53";
    public const string StartTimeRequired = "Start time is required";
    public const string EndTimeRequired = "End time is required";
    public const string NotAValidTime = "Invalid time format";
    public const string EndTimeMustBeGreaterThanStartTime = "End time must be after start time at least 30 minutes";
    public const string EndTimeMustBeInEightTeenHoursAfterStartTime = "End time must be after start time at most 18 hours";
    public const string ScheduleNotFound = "Schedule not found";
    public const string ScheduleNotBelongToMentor = "You don't have permission to modify this schedule";
    public const string ScheduleHaveUpcomingSession = "Cannot modify schedule with upcoming mentoring session";
    public const string PastDateNotAllowed = "Cannot create schedule for past dates";
    public const string PastTimeNotAllowed = "Cannot create schedule for past time";
    public const string MentorAccessRequired = "Schedule management is only available for mentors";
}

public static class ScheduleErrors
{
    public static Error InvalidDateAvailable =>
        new(nameof(InvalidDateAvailable), ScheduleErrorMessages.InvalidDateAvailable);
    public static Error TimeConflict =>
        new(nameof(TimeConflict), ScheduleErrorMessages.TimeConflict);
    public static Error DateAvailableMustBeInAWeek =>
        new(nameof(DateAvailableMustBeInAWeek), ScheduleErrorMessages.DateAvailableMustBeInAWeek);
    public static Error TimeBlockRequired =>
        new(nameof(TimeBlockRequired), ScheduleErrorMessages.TimeBlockRequired);
    public static Error IsRepeatingRequired =>
        new(nameof(IsRepeatingRequired), ScheduleErrorMessages.IsRepeatingRequired);
    public static Error RepeatingWeeksGreaterThanZero =>
        new(nameof(RepeatingWeeksGreaterThanZero), ScheduleErrorMessages.RepeatingWeeksGreaterThanZero);
    public static Error RepeatingWeeksLessThanFiftyThree =>
        new(nameof(RepeatingWeeksLessThanFiftyThree), ScheduleErrorMessages.RepeatingWeeksLessThanFiftyThree);
    public static Error StartTimeRequired =>
        new(nameof(StartTimeRequired), ScheduleErrorMessages.StartTimeRequired);
    public static Error EndTimeRequired =>
        new(nameof(EndTimeRequired), ScheduleErrorMessages.EndTimeRequired);
    public static Error NotAValidTime =>
        new(nameof(NotAValidTime), ScheduleErrorMessages.NotAValidTime);
    public static Error EndTimeMustBeGreaterThanStartTime =>
        new(nameof(EndTimeMustBeGreaterThanStartTime), ScheduleErrorMessages.EndTimeMustBeGreaterThanStartTime);
    public static Error EndTimeMustBeInEightTeenHoursAfterStartTime =>
        new(nameof(EndTimeMustBeInEightTeenHoursAfterStartTime), ScheduleErrorMessages.EndTimeMustBeInEightTeenHoursAfterStartTime);
    public static Error ScheduleNotFound =>
        new(nameof(ScheduleNotFound), ScheduleErrorMessages.ScheduleNotFound);
    public static Error ScheduleNotBelongToMentor =>
        new(nameof(ScheduleNotBelongToMentor), ScheduleErrorMessages.ScheduleNotBelongToMentor);
    public static Error ScheduleHaveUpcomingSession =>
        new(nameof(ScheduleHaveUpcomingSession), ScheduleErrorMessages.ScheduleHaveUpcomingSession);
    public static Error PastDateNotAllowed =>
        new(nameof(PastDateNotAllowed), ScheduleErrorMessages.PastDateNotAllowed);
    public static Error PastTimeNotAllowed =>
        new(nameof(PastTimeNotAllowed), ScheduleErrorMessages.PastTimeNotAllowed);
    public static Error MentorAccessRequired =>
        new(nameof(MentorAccessRequired), ScheduleErrorMessages.MentorAccessRequired);
}