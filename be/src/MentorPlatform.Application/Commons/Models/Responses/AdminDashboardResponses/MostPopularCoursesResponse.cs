namespace MentorPlatform.Application.Commons.Models.Responses.AdminDashboardResponses;

public class MostPopularCoursesResponse
{
    public List<MostPopularCourse> Courses { get; set; } = new List<MostPopularCourse>();
}

public class MostPopularCourse
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
    public int SessionCount { get; set; }
    public string MentorName { get; set; } = string.Empty;
    public string? MentorAvatar { get; set; }
}