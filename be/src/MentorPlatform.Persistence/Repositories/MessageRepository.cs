using MentorPlatform.Domain.Entities;
using MentorPlatform.Domain.Repositories;

namespace MentorPlatform.Persistence.Repositories;
public class MessageRepository : Repository<Message, Guid>, IMessageRepository
{
    public MessageRepository(ApplicationDbContext dbContext) : base(dbContext)
    {
    }
}
