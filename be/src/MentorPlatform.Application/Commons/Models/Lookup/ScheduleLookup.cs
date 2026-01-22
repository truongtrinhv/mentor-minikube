namespace MentorPlatform.Application.Commons.Models.Lookup;

public class ScheduleLookup
{
    public Guid Id { get; set; }
    public DateTimeOffset StartTime { get; set; }
    public DateTimeOffset EndTime { get; set; }
}
