using MentorPlatform.Domain.Primitives;

namespace MentorPlatform.Domain.Events;

/// <summary>
/// Event raised when a mentoring session is created
/// </summary>
public class MentoringSessionCreatedEvent : DomainEvent
{
    public Guid SessionId { get; set; }
    public Guid LearnerId { get; set; }
    public Guid MentorId { get; set; }
    public Guid ScheduleId { get; set; }
    public Guid CourseId { get; set; }
    public int SessionType { get; set; }
}

/// <summary>
/// Event raised when a mentoring session status changes
/// </summary>
public class MentoringSessionStatusChangedEvent : DomainEvent
{
    public Guid SessionId { get; set; }
    public int OldStatus { get; set; }
    public int NewStatus { get; set; }
    public Guid LearnerId { get; set; }
    public Guid MentorId { get; set; }
}

/// <summary>
/// Event raised when a mentoring session is completed
/// </summary>
public class MentoringSessionCompletedEvent : DomainEvent
{
    public Guid SessionId { get; set; }
    public Guid LearnerId { get; set; }
    public Guid MentorId { get; set; }
    public DateTime CompletedAt { get; set; }
}

/// <summary>
/// Event raised when a mentoring session is cancelled
/// </summary>
public class MentoringSessionCancelledEvent : DomainEvent
{
    public Guid SessionId { get; set; }
    public Guid LearnerId { get; set; }
    public Guid MentorId { get; set; }
    public string? CancellationReason { get; set; }
}
