namespace MentorPlatform.Application.Commons.Models.Query;

public class MentoringSessionParameters : QueryParameters
{
    public Guid? CourseId { get; set; }
    public int? SessionStatus { get; set; }
    public DateTimeOffset? From { get; set; }
    public DateTimeOffset? To { get; set; }
}