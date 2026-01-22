
using MentorPlatform.Domain.Enums;
using MentorPlatform.Domain.Primitives;

namespace MentorPlatform.Domain.Entities;

public class MentoringSession : AuditableEntity, IHasKey<Guid>, ISoftDeleteEntity, IConcurrencyEntity
{
    public Guid Id { get; set; }
    public Guid LearnerId { get; set; }
    public User Learner { get; set; } = default!;
    public Guid CourseId { get; set; }
    public Course Course { get; set; } = default!;
    public Guid ScheduleId { get; set; }
    public Schedule Schedule { get; set; } = default!;
    public Guid? OldScheduleId { get; set; } = default;
    public Schedule? OldSchedule { get; set; }
    public string Notes { get; set; } = default!;
    public RequestMentoringSessionStatus RequestStatus { get; set; }
    public SessionType SessionType { get; set; }
    public bool IsDeleted { get; set; }
    public byte[] RowVersion { get; set; }
}
