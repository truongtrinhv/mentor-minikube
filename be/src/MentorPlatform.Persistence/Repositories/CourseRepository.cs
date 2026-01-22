using MentorPlatform.Domain.Entities;
using MentorPlatform.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace MentorPlatform.Persistence.Repositories;

public class CourseRepository : Repository<Course, Guid>, ICourseRepository
{
    public CourseRepository(ApplicationDbContext dbContext) : base(dbContext)
    {
    }

    public async Task<Dictionary<Course, int>> GetMostPopularCoursesWithSessionCount(DateTimeOffset from, DateTimeOffset to)
    {
        return await _dbSet.Include(c => c.Mentor)
            .ThenInclude(m => m.UserDetail)
            .Include(c => c.CourseCategory)
            .Select(c => new
            {
                Course = c,
                SessionCount = c.MentoringSessions!
                        .Where(ms => ms.Schedule.StartTime >= from && ms.Schedule.StartTime <= to)
                        .Count(),
            })
            .Where(x => x.SessionCount > 0)
            .OrderByDescending(x => x.SessionCount)
            .Take(10)
            .ToDictionaryAsync(x => x.Course, x => x.SessionCount);
    }
}
