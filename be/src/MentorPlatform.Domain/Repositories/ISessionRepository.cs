using MentorPlatform.Domain.Entities;

namespace MentorPlatform.Domain.Repositories;
public interface ISessionRepository : IRepository<MentoringSession, Guid>
{
}
