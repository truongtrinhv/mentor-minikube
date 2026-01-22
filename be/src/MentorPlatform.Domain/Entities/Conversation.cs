using MentorPlatform.Domain.Primitives;

namespace MentorPlatform.Domain.Entities;
public class Conversation : AuditableEntity, IHasKey<Guid>, ISoftDeleteEntity
{
    public Guid Id { get; set; }
    public string ConversationName { get; set; }
    public bool IsGroup { get; set; }

    public virtual ICollection<Participant>? Participants { get; set; }
    public virtual ICollection<Message>? Messages { get; set; }

    public bool IsDeleted { get; set; }
}
