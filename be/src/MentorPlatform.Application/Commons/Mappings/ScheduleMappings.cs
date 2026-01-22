using MentorPlatform.Application.Commons.Enums;
using MentorPlatform.Application.Commons.Models.Responses.ScheduleResponses;
using MentorPlatform.Domain.Entities;
using MentorPlatform.Domain.Enums;

namespace MentorPlatform.Application.Commons.Mappings;

public static class ScheduleMappings
{
    public static TimeSlotResponse ToTimeSlotResponse(this Schedule schedule)
    {
        return new TimeSlotResponse
        {
            Id = schedule.Id,
            StartTime = schedule.StartTime,
            EndTime = schedule.EndTime,
            Status = GetTimeSlotStatus(schedule)
        };
    }

    private static TimeSlotStatus GetTimeSlotStatus(Schedule schedule)
    {
        var activeMentoringSession = schedule.MentoringSessions?
            .FirstOrDefault(ms => ms.RequestStatus != RequestMentoringSessionStatus.Cancelled);

        if (activeMentoringSession != null)
        {
            return TimeSlotStatus.Unavailable;
        }

        return TimeSlotStatus.Available;
    }

    public static ScheduleResponse ToResponse(this Schedule schedule)
    {
        return new ScheduleResponse
        {
            Id = schedule.Id,
            StartTime = schedule.StartTime,
            EndTime = schedule.EndTime
        };
    }
}