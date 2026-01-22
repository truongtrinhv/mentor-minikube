using MentorPlatform.Application.Commons.Enums;

namespace MentorPlatform.Application.Commons.Models.Responses.ScheduleResponses;

public class TimeSlotResponse
{
    public Guid Id { get; set; }
    public DateTimeOffset StartTime { get; set; }
    public DateTimeOffset EndTime { get; set; }
    public TimeSlotStatus Status { get; set; }
}

public class DayTimeSlotsResponse
{
    public DateTime Date { get; set; }
    public List<TimeSlotResponse> TimeSlots { get; set; } = new();
} 