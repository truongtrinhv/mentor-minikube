
using MentorPlatform.Domain.Enums;
using MentorPlatform.Domain.Primitives;
using System.Text.Json.Serialization;

namespace MentorPlatform.Domain.Entities;

public class UserDetail : AuditableEntity, IHasKey<Guid>, ISoftDeleteEntity
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    [JsonIgnore]
    public User User { get; set; } = default!;
    public string FullName { get; set; } = default!;
    public string? Bio { get; set; } = default;
    public string? AvatarUrl { get; set; } = default;
    public string? Experience { get; set; } = default;
    public CommunicationPreference CommunicationPreference { get; set; }
    public string? ProfessionalSkill { get; set; } = default;
    public string? Goals { get; set; }
    public int Duration { get; set; }
    public SessionFrequency SessionFrequency { get; set; }
    public LearningStyle? LearningStyle { get; set; } = default!;

    public List<TeachingStyle>? TeachingStyles { get; set; } = default!;
    public List<UserAvailability>? Availability { get; set; } = default;

    public bool IsDeleted { get; set; }
}
