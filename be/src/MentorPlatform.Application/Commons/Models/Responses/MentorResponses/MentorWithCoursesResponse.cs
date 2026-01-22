using MentorPlatform.Application.Commons.Models.Responses.CourseResponses;

namespace MentorPlatform.Application.Commons.Models.Responses.MentorResponses;

public class MentorWithCoursesResponse
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public List<string> Expertise { get; set; } = new();
    public string? Bio { get; set; }
    public List<CourseDetailsResponse> Courses { get; set; } = new();
} 