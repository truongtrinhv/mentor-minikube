using MentorPlatform.Domain.Enums;

namespace MentorPlatform.Application.Commons.Models.Requests.MentoringSessionRequest;
public class CreateSessionRequest
{
    public Guid CourseId { get; set; }
    public Guid ScheduleId { get; set; }
    public SessionType SessionType { get; set; }
}
