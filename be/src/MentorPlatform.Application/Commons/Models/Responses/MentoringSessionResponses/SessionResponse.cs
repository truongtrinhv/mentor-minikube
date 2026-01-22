using MentorPlatform.Application.Commons.Models.Responses.CourseResponses;
using MentorPlatform.Application.Commons.Models.Responses.ScheduleResponses;
using MentorPlatform.Domain.Enums;

namespace MentorPlatform.Application.Commons.Models.Responses.MentoringSessionResponses;
public class SessionResponse
{
    public Guid Id { get; set; }
    public CourseResponse Course { get; set; }
    public ScheduleResponse Schedule { get; set; }
    public RequestMentoringSessionStatus RequestStatus { get; set; }
    public SessionType SessionType { get; set; }
    public string StudentName { get; set; }
}
