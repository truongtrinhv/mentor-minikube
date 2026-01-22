
using MentorPlatform.Domain.Primitives;

namespace MentorPlatform.Domain.Entities;

public class Schedule : AuditableEntity, IHasKey<Guid>, ISoftDeleteEntity
{
    public Guid Id { get; set; }
    public Guid MentorId { get; set; }
    public User Mentor { get; set; } = default!;
    public DateTimeOffset StartTime { get; set; }
    public DateTimeOffset EndTime { get; set; }
    public ICollection<MentoringSession>? MentoringSessions { get; set; }
    public ICollection<MentoringSession>? OldMentoringSessions { get; set; }
    public bool IsDeleted { get; set; }
}
