using MentorPlatform.Domain.Entities;
using MentorPlatform.Domain.Repositories;

namespace MentorPlatform.Persistence.Repositories;
public class NotificationRepository : Repository<Notification, Guid>, INotificationRepository
{
    public NotificationRepository(ApplicationDbContext dbContext) : base(dbContext)
    {
    }
}
