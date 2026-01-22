namespace MentorPlatform.Application.Commons.Models.Query;

public class ScheduleQueryParameters
{
    public Guid? MentorId { get; set; }
    public DateTimeOffset StartDate { get; set; } = DateTime.UtcNow.Date;
    public DateTimeOffset EndDate { get; set; } = DateTime.UtcNow.Date.AddDays(7);

}