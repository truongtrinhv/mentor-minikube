using MentorPlatform.Application.Commons.Models.Responses.MentoringSessionResponses;
using MentorPlatform.Domain.Entities;

namespace MentorPlatform.Application.Commons.Mappings;
public static class MentoringSessionMapping
{
    public static SessionResponse ToResponse(this MentoringSession session)
    {
        return new SessionResponse
        {
            Id = session.Id,
            Course = session.Course.ToResponse(),
            Schedule = session.Schedule.ToResponse(),
            RequestStatus = session.RequestStatus,
            SessionType = session.SessionType,
            StudentName = session.Learner.UserDetail.FullName
        };
    }
}
