using MentorPlatform.Domain.Entities;
using MentorPlatform.Domain.Repositories;

namespace MentorPlatform.Persistence.Repositories;
public class ResourceRepository : Repository<Resource, Guid>, IResourceRepository
{
    public ResourceRepository(ApplicationDbContext dbContext) : base(dbContext)
    {
    }
}
