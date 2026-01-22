using MentorPlatform.Application.Commons.Models.Lookup;
using MentorPlatform.Domain.Enums;

namespace MentorPlatform.Application.Commons.Models.Responses.LearnerDashboardResponses;
public class EnrolledCourseResponse
{
    public Guid Id { get; set; }
    public string Title { get; set; } = default!;
    public string? Description { get; set; }
    public string? MentorAvatar { get; set; }
    public string MentorName { get; set; } = default!;
    public string MentorEmail { get; set; } = default!;
    public LookupModel Category { get; set; } = default!;
    public CourseLevel Level { get; set; }
    public int LearnerCount { get; set; }
    public int ScheduledSessionCount { get; set; }
    public int CompletedSessionCount { get; set; }
}
