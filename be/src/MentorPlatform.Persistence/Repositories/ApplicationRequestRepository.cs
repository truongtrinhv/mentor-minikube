using MentorPlatform.Domain.Entities;
using MentorPlatform.Domain.Repositories;

namespace MentorPlatform.Persistence.Repositories;

public class ApplicationRequestRepository : Repository<ApplicationRequest, Guid>, IApplicationRequestRepository
{
    public ApplicationRequestRepository(ApplicationDbContext dbContext) : base(dbContext)
    {
    }
}