
using MentorPlatform.Domain.Primitives;

namespace MentorPlatform.Domain.Entities;

public class CourseResource : AuditableEntity, IHasKey<Guid>, ISoftDeleteEntity
{
    public Guid Id { get; set; }
    public Guid CourseId { get; set; }
    public Guid ResourceId { get; set; }
    public Resource Resource { get; set; }
    public Course Course { get; set; } = default!;
    public bool IsDeleted { get; set; }
}
