namespace MentorPlatform.Application.Commons.Models.Responses.AdminDashboardResponses;

public class CourseStatsResponse
{
    public int CourseCount { get; set; }
    public int NewCourseThisMonthCount { get; set; }
    public int ResourceCount { get; set; }
    public int NewResourceThisMonthCount { get; set; }
}