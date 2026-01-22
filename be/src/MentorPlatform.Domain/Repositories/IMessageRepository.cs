using MentorPlatform.Domain.Entities;

namespace MentorPlatform.Domain.Repositories;
public interface IMessageRepository : IRepository<Message, Guid>
{
}
