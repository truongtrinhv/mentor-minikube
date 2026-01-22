using MentorPlatform.Domain.Entities;
using MentorPlatform.Domain.Enums;
using MentorPlatform.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace MentorPlatform.Persistence.Repositories;

public class MentoringSessionRepository : Repository<MentoringSession, Guid>, IMentoringSessionRepository
{
    public MentoringSessionRepository(ApplicationDbContext dbContext) : base(dbContext)
    {
    }

    public async Task<List<MentoringSession>> GetMentorUpcomingSessions(Guid mentorId)
    {
        return await _dbSet
            .Include(m => m.Course)
            .ThenInclude(c => c.CourseCategory)
            .Include(m => m.Schedule)
            .Include(m => m.Learner)
            .ThenInclude(l => l.UserDetail)
            .Where(s => s.Course.MentorId == mentorId)
            .Where(s => s.Schedule.EndTime.Date >= DateTime.UtcNow &&
            s.Schedule.StartTime <= DateTime.UtcNow.AddHours(24))
            .ToListAsync();
    }

    public async Task<Dictionary<RequestMentoringSessionStatus, int>> CountSessionsByStatusAsync(DateTimeOffset from, DateTimeOffset to)
    {
        return await _dbSet.Where(ms => ms.Schedule.StartTime >= from && ms.Schedule.StartTime <= to)
                            .GroupBy(ms => ms.RequestStatus)
                            .ToDictionaryAsync(g => g.Key, g => g.Count());
    }
}
