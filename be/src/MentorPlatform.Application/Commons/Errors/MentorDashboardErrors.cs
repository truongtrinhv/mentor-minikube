using MentorPlatform.Domain.Shared;

namespace MentorPlatform.Application.Commons.Errors;
public static class MentorDashboardErrorMessages
{
    public const string CourseNumberMustBeLargerThanZero = "Course number must be larger than 0";
    public const string UpcomingSessionNumberMustBeLargerThanZero = "Upcoming session number must be larger than 0";
    public const string NotificationNumberMustBeLargerThanZero = "Notification number must be larger than 0";
}

public static class MentorDashboardErrors
{
    public static Error CourseNumberMustBeLargerThanZero => new(nameof(CourseNumberMustBeLargerThanZero),
        MentorDashboardErrorMessages.CourseNumberMustBeLargerThanZero);
    public static Error UpcomingSessionNumberMustBeLargerThanZero => new(nameof(UpcomingSessionNumberMustBeLargerThanZero),
        MentorDashboardErrorMessages.UpcomingSessionNumberMustBeLargerThanZero);
    public static Error NotificationNumberMustBeLargerThanZero => new(nameof(NotificationNumberMustBeLargerThanZero),
        MentorDashboardErrorMessages.NotificationNumberMustBeLargerThanZero);
}
