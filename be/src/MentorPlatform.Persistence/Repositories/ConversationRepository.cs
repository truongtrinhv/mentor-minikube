using MentorPlatform.Domain.Entities;
using MentorPlatform.Domain.Repositories;

namespace MentorPlatform.Persistence.Repositories;
public class ConversationRepository : Repository<Conversation, Guid>, IConversationRepository
{
    public ConversationRepository(ApplicationDbContext dbContext) : base(dbContext)
    {
    }
}
