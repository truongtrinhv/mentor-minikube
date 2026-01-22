using MentorPlatform.Application.Commons.Models.Responses.MentoringSessionResponses;
using MentorPlatform.Domain.Entities;
using MentorPlatform.Domain.Enums;

namespace MentorPlatform.Application.Commons.Mappings;

public static class MentoringSessionMappings
{
    public static MentoringSessionResponseForLearner ToMentoringSessionResponseForLearner(this MentoringSession session)
    {
        bool isSessionBeingRescheduled = session.OldSchedule != null && session.RequestStatus == RequestMentoringSessionStatus.Rescheduling;
        Schedule currentSchedule = isSessionBeingRescheduled ? session.OldSchedule! : session.Schedule;
        Schedule? newSchedule = isSessionBeingRescheduled ? session.Schedule : null;

        return new MentoringSessionResponseForLearner()
        {
            Id = session.Id,
            StartTime = currentSchedule.StartTime.ToString("O"),
            EndTime = currentSchedule.EndTime.ToString("O"),
            CourseName = session.Course.Title,
            SessionType = (int)session.SessionType,
            SessionStatus = (int)session.RequestStatus,
            MentorName = session.Schedule.Mentor.UserDetail.FullName,
            NewStartTime = newSchedule?.StartTime.ToString("O") ?? string.Empty,
            NewEndTime = newSchedule?.EndTime.ToString("O") ?? string.Empty,
            Notes = session.Notes ?? string.Empty,
        };
    }

    public static MentoringSessionResponseForMentor ToMentoringSessionResponseForMentor(this MentoringSession session)
    {
        return new MentoringSessionResponseForMentor()
        {
            Id = session.Id,
            StartTime = session.Schedule.StartTime.ToString("O"),
            EndTime = session.Schedule.EndTime.ToString("O"),
            CourseName = session.Course.Title,
            SessionType = (int)session.SessionType,
            SessionStatus = (int)session.RequestStatus,
            LearnerName = session.Learner.UserDetail.FullName,
        };
    }
}
