using MentorPlatform.Domain.Entities;
using MentorPlatform.Domain.Repositories;

namespace MentorPlatform.Persistence.Repositories;
public class SessionRepository : Repository<MentoringSession, Guid>, ISessionRepository
{
    public SessionRepository(ApplicationDbContext dbContext) : base(dbContext)
    {
    }
}
