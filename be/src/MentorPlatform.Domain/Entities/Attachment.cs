using MentorPlatform.Domain.Primitives;
using System.Text.Json.Serialization;

namespace MentorPlatform.Domain.Entities;
public class Attachment : AuditableEntity, IHasKey<Guid>, ISoftDeleteEntity
{
    public Guid Id { get; set; }
    public string Url { get; set; }
    public string? Type { get; set; }
    public int Size { get; set; }

    public Guid MessageId { get; set; }

    [JsonIgnore]
    public Message Message { get; set; }

    public bool IsDeleted { get; set; }
}
