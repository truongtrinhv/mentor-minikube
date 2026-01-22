
using MentorPlatform.Domain.Primitives;

namespace MentorPlatform.Domain.Entities;

public class RefreshToken : AuditableEntity, IHasKey<Guid>, ISoftDeleteEntity
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public DateTime Expired { get; set; }
    public string Value { get; set; } = default!;
    public bool IsDeleted { get; set; }
}
