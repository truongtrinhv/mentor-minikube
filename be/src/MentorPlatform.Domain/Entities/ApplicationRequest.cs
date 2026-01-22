
using MentorPlatform.Domain.Enums;
using MentorPlatform.Domain.Primitives;
using System.Text.Json.Serialization;

namespace MentorPlatform.Domain.Entities;

public class ApplicationRequest : AuditableEntity, IHasKey<Guid>, ISoftDeleteEntity
{
    public Guid Id { get; set; }
    public string Education { get; set; } = default!;
    public string WorkExperience { get; set; } = default!;
    public string Description { get; set; } = default!;
    public string? Note { get; set; } = default!;
    public ApplicationRequestStatus Status { get; set; }
    
    public DateTime Submitted { get; set; }
    public List<string>? Certifications { get; set; } = default;
    public Guid MentorId { get; set; }
    [JsonIgnore]
    public User Mentor { get; set; } = default!;

    public virtual ICollection<ApplicationDocument>? ApplicationDocuments { get; set; } = default;
    public bool IsDeleted { get; set; }
}
