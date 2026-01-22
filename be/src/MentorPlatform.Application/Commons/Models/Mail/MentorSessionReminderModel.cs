
using MentorPlatform.Domain.Enums;

namespace MentorPlatform.Application.Commons.Models.Mail;

public class MentorSessionReminderModel : EmailAbstractModel
{
    public DateTimeOffset StartTime { get; set; } = default!;
    public DateTimeOffset EndTime { get; set; } = default!;
    public SessionType SessionType { get; set; } = default!;
    public string CourseName { get; set; } = default!;
    public string MentorName { get; set; } = default!;
    public string LearnerName { get; set; } = default!;
}