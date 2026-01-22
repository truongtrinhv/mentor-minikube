using MentorPlatform.Domain.Primitives;
using System.Text.Json.Serialization;

namespace MentorPlatform.Domain.Entities;
public class Participant : AuditableEntity, IHasKey<Guid>, ISoftDeleteEntity
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid ConversationId { get; set; }
    public DateTime? LastRead { get; set; }

    [JsonIgnore]
    public User User { get; set; }

    [JsonIgnore]
    public Conversation Conversation { get; set; }

    public bool IsDeleted { get; set; }

}
