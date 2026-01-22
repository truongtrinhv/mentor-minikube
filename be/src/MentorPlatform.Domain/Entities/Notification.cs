using MentorPlatform.Domain.Primitives;

namespace MentorPlatform.Domain.Entities;
public class Notification : AuditableEntity, IHasKey<Guid>, ISoftDeleteEntity
{
    public Guid Id { get; set; }
    public string Title { get; set; }
    public string Message { get; set; }
    public Guid OwnerId { get; set; }
    public bool IsRead { get; set; } = false;

    public User Owner { get; set; }

    public bool IsDeleted { get; set; }
}
