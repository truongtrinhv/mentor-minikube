namespace MentorPlatform.Application.Commons.Models.Responses.MentoringSessionResponses;

public abstract class MentoringSessionResponse
{
    public Guid Id { get; set; }
    public string StartTime { get; set; } = default!;
    public string EndTime { get; set; } = default!;
    public string CourseName { get; set; } = default!;
    public int SessionType { get; set; }
    public int SessionStatus { get; set; }
}