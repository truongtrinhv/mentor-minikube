using MentorPlatform.Domain.Enums;

namespace MentorPlatform.Application.Commons.Models.Responses.LearnerDashboardResponses;
public class LeanerUpcommingSessionReponse
{
    public Guid Id { get; set; }
    public string CourseTitle { get; set; } = default!;
    public string MentorName { get; set; } = default!;
    public string MentorAvatar { get; set; } = default!;
    public DateTimeOffset ScheduledDate { get; set; } = default!;
    public DateTimeOffset StartTime { get; set; }
    public DateTimeOffset EndTime { get; set; }
    public SessionType SessionType { get; set; }
    public RequestMentoringSessionStatus Status { get; set; }
}
