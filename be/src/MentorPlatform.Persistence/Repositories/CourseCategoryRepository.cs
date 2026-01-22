
using MentorPlatform.Domain.Entities;
using MentorPlatform.Domain.Repositories;

namespace MentorPlatform.Persistence.Repositories;

public class CourseCategoryRepository : Repository<CourseCategory, Guid>, ICourseCategoryRepository
{
    public CourseCategoryRepository(ApplicationDbContext dbContext) : base(dbContext)
    {
    }

}
