
using MentorPlatform.Domain.Primitives;

namespace MentorPlatform.Domain.Entities;

public class Expertise : AuditableEntity, IHasKey<Guid>, ISoftDeleteEntity
{
    public string Name { get; set; } = default!;
    public Guid Id { get; set; }
    public virtual ICollection<UserExpertise>? UserExpertises { get; set; }
    public bool IsDeleted { get; set; }
}
