namespace MentorPlatform.Application.Commons.Models.Responses.AdminDashboardResponses;

public class SessionStatsResponse
{
    public int SessionThisMonthCount { get; set; }
    public int PendingSessionThisMonthCount { get; set; }
    public int ScheduledSessionThisMonthCount { get; set; }
    public int CancelledSessionThisMonthCount { get; set; }
    public int ReschedulingSessionThisMonthCount { get; set; }
    public int CompletedSessionThisMonthCount { get; set; }
}