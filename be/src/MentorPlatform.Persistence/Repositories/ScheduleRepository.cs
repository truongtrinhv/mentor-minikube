using MentorPlatform.Domain.Entities;
using MentorPlatform.Domain.Repositories;

namespace MentorPlatform.Persistence.Repositories;
public class ScheduleRepository : Repository<Schedule, Guid>, IScheduleRepository
{
    public ScheduleRepository(ApplicationDbContext dbContext) : base(dbContext)
    {
    }
}
