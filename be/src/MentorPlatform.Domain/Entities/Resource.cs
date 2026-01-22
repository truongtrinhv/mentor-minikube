
using MentorPlatform.Domain.Primitives;

namespace MentorPlatform.Domain.Entities;

public class Resource : AuditableEntity, IHasKey<Guid>, ISoftDeleteEntity
{
    public Guid Id { get; set; }
    public Guid MentorId { get; set; }
    public string FileType { get; set; } = default!;
    public string FilePath { get; set; } = default!;
    public string Title { get; set; } = default!;
    public string Description { get; set; } = default!;
    public bool IsDeleted { get; set; }

    public User Mentor { get; set; } = default!;
    public ICollection<CourseResource> CourseResources { get; set; } = default!;
}
