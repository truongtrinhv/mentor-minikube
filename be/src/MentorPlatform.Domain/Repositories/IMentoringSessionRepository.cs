using MentorPlatform.Domain.Entities;
using MentorPlatform.Domain.Enums;

namespace MentorPlatform.Domain.Repositories;

public interface IMentoringSessionRepository : IRepository<MentoringSession, Guid>
{
    Task<List<MentoringSession>> GetMentorUpcomingSessions(Guid mentorId);
    Task<Dictionary<RequestMentoringSessionStatus, int>> CountSessionsByStatusAsync(DateTimeOffset from, DateTimeOffset to);
}
