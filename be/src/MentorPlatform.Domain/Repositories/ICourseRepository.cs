using MentorPlatform.Domain.Entities;

namespace MentorPlatform.Domain.Repositories;

public interface ICourseRepository : IRepository<Course, Guid>
{
    Task<Dictionary<Course, int>> GetMostPopularCoursesWithSessionCount(DateTimeOffset from, DateTimeOffset to);
}
