namespace MentorPlatform.Application.Commons.Models.Responses.ScheduleResponses;

public class ScheduleResponse
{
    public Guid Id { get; set; }
    public DateTimeOffset StartTime { get; set; }
    public DateTimeOffset EndTime { get; set; }
}