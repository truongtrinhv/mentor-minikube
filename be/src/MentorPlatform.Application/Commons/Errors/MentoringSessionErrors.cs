using MentorPlatform.Domain.Shared;

namespace MentorPlatform.Application.Commons.Errors;

public static class MentoringSessionErrorMessages
{
    public const string MentorNotExists = "Mentor does not exist.";
    public const string MentoringSessionNotExists = "Session does not exist.";
    public const string MentoringSessionIsUsed = "Mentoring session is currently used.";
    public const string OnlyLeanerCanCreateRequest = "Only learners can request mentoring sessions.";
    public const string ScheduleNotExists = "Schedule does not exist.";
    public const string ScheduleDateIsInThePast = "Schedule date is in the past, not available now.";
    public const string ScheduleIsAlreadyBooked = "Schedule is already booked for a session.";
    public const string ScheduleIsNotBelongToThisMentor = "Schedule does not belong to this mentor.";
    public const string AdminCannotGetMentoringSessions = "Admins cannot get mentoring sessions.";
    public const string InvalidMentoringSessionStatus = "Invalid session status.";
    public const string InvalidStartAndEndDates = "Start date must come before end date.";
    public const string NotYourCourse = "This course belongs to another mentor.";
    public const string DoNotHavePermission = "You do not have permission to perform this action.";
    public const string LearnersCanOnlyApproveIfRescheduling = "Learners can only approve sessions that are being rescheduled.";
    public const string LearnersCanOnlyRejectIfRescheduling = "Learners can only reject sessions that are being rescheduled.";
    public const string MentorsCanOnlyApproveIfPending = "Mentors can only approve pending sessions.";
    public const string MentorsCanOnlyCompleteIfScheduled = "Mentors can only complete scheduled sessions.";
    public const string MentorCanOnlyReschedulePendingSessions = "Mentors can only reschedule pending sessions.";
    public const string RescheduleNotesMustNotBeEmpty = "Reschedule notes must not be empty.";
    public const string RescheduleNotesTooLong = "Reschedule notes must not exceed 200 characters.";
}

public static class MentoringSessionErrors
{
    public static Error MentoringSessionNotExists => new(nameof(MentoringSessionNotExists),
        MentoringSessionErrorMessages.MentoringSessionNotExists);

    public static Error MentoringSessionIsUsed => new(nameof(MentoringSessionIsUsed),
       MentoringSessionErrorMessages.MentoringSessionIsUsed);

    public static Error MentorNotExists => new(nameof(MentorNotExists),
       MentoringSessionErrorMessages.MentorNotExists);

    public static Error OnlyLeanerCanCreateRequest => new(nameof(OnlyLeanerCanCreateRequest),
       MentoringSessionErrorMessages.OnlyLeanerCanCreateRequest);

    public static Error ScheduleNotExists => new(nameof(ScheduleNotExists),
       MentoringSessionErrorMessages.ScheduleNotExists);

    public static Error ScheduleDateIsInThePast => new(nameof(ScheduleDateIsInThePast),
       MentoringSessionErrorMessages.ScheduleDateIsInThePast);

    public static Error ScheduleIsAlreadyBooked => new(nameof(ScheduleIsAlreadyBooked),
       MentoringSessionErrorMessages.ScheduleIsAlreadyBooked);

    public static Error ScheduleIsNotBelongToThisMentor => new(nameof(ScheduleIsNotBelongToThisMentor),
       MentoringSessionErrorMessages.ScheduleIsNotBelongToThisMentor);

    public static Error AdminCannotGetMentoringSessions => new(nameof(AdminCannotGetMentoringSessions),
        MentoringSessionErrorMessages.AdminCannotGetMentoringSessions);

    public static Error InvalidMentoringSessionStatus => new(nameof(InvalidMentoringSessionStatus),
        MentoringSessionErrorMessages.InvalidMentoringSessionStatus);

    public static Error InvalidStartAndEndDates => new(nameof(InvalidStartAndEndDates),
        MentoringSessionErrorMessages.InvalidStartAndEndDates);

    public static Error NotYourCourse => new(nameof(NotYourCourse),
        MentoringSessionErrorMessages.NotYourCourse);

    public static Error DoNotHavePermission => new(nameof(DoNotHavePermission),
        MentoringSessionErrorMessages.DoNotHavePermission);

    public static Error LearnersCanOnlyApproveIfRescheduling => new(nameof(LearnersCanOnlyApproveIfRescheduling),
        MentoringSessionErrorMessages.LearnersCanOnlyApproveIfRescheduling);

    public static Error LearnersCanOnlyRejectIfRescheduling => new(nameof(LearnersCanOnlyRejectIfRescheduling),
        MentoringSessionErrorMessages.LearnersCanOnlyRejectIfRescheduling);

    public static Error MentorsCanOnlyApproveIfPending => new(nameof(MentorsCanOnlyApproveIfPending),
        MentoringSessionErrorMessages.MentorsCanOnlyApproveIfPending);

    public static Error MentorsCanOnlyCompleteIfScheduled => new(nameof(MentorsCanOnlyCompleteIfScheduled),
        MentoringSessionErrorMessages.MentorsCanOnlyCompleteIfScheduled);

    public static Error MentorCanOnlyReschedulePendingSessions => new(nameof(MentorCanOnlyReschedulePendingSessions),
        MentoringSessionErrorMessages.MentorCanOnlyReschedulePendingSessions);
}
