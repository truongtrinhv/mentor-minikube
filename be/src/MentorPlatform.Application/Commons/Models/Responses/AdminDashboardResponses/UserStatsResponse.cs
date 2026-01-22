namespace MentorPlatform.Application.Commons.Models.Responses.AdminDashboardResponses;

public class UserStatsResponse
{
    public int ActiveUserCount { get; set; }
    public int NewUsersThisMonth { get; set; }
    public int ActiveAdminCount { get; set; }
    public int ActiveMentorCount { get; set; }
    public int ActiveLearnerCount { get; set; }
    public int ActiveApprovedMentorCount { get; set; }
    public int ActiveUnapprovedMentorCount { get; set; }
    public int PendingApplicationsCount { get; set; }
    public int PendingApplicationsThisMonth { get; set; }
}