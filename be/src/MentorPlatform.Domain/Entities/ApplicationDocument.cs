
using MentorPlatform.Domain.Primitives;

namespace MentorPlatform.Domain.Entities;

public class ApplicationDocument : AuditableEntity, IHasKey<Guid>, ISoftDeleteEntity
{
    public Guid Id { get; set; }
    public string FileName { get; set; } = default!;
    public string FilePath { get; set; } = default!;
    public Guid ApplicationRequestId { get; set; }
    public ApplicationRequest ApplicationRequest { get; set; } = default!;
    public bool IsDeleted { get; set; }
}
