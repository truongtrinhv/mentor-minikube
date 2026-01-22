using MentorPlatform.Domain.Primitives;
using System.Text.Json.Serialization;

namespace MentorPlatform.Domain.Entities;
public class Message : AuditableEntity, IHasKey<Guid>, ISoftDeleteEntity
{
    public Guid Id { get; set; }
    public string Content { get; set; }

    public Guid ConversationId { get; set; }
    public Guid SenderId { get; set; }

    [JsonIgnore]
    public User Sender { get; set; }
    [JsonIgnore]
    public Conversation Conversation { get; set; }

    public virtual ICollection<Attachment>? Attachments { get; set; }

    public bool IsDeleted { get; set; }
}
