using MentorPlatform.Domain.Primitives;

namespace MentorPlatform.Domain.Events;

/// <summary>
/// Event raised when an application request is submitted
/// </summary>
public class ApplicationRequestSubmittedEvent : DomainEvent
{
    public Guid RequestId { get; set; }
    public Guid UserId { get; set; }
    public DateTime SubmittedAt { get; set; }
}

/// <summary>
/// Event raised when application request status changes
/// </summary>
public class ApplicationRequestStatusChangedEvent : DomainEvent
{
    public Guid RequestId { get; set; }
    public Guid UserId { get; set; }
    public int OldStatus { get; set; }
    public int NewStatus { get; set; }
    public string? Reason { get; set; }
}

/// <summary>
/// Event raised when documents are validated
/// </summary>
public class DocumentsValidatedEvent : DomainEvent
{
    public Guid RequestId { get; set; }
    public bool IsValid { get; set; }
    public string? ValidationMessage { get; set; }
}

/// <summary>
/// Event raised when background check is completed
/// </summary>
public class BackgroundCheckCompletedEvent : DomainEvent
{
    public Guid RequestId { get; set; }
    public bool Passed { get; set; }
    public string? CheckDetails { get; set; }
}

/// <summary>
/// Event raised when a reviewer is assigned
/// </summary>
public class ReviewerAssignedEvent : DomainEvent
{
    public Guid RequestId { get; set; }
    public Guid ReviewerId { get; set; }
    public DateTime AssignedAt { get; set; }
}

/// <summary>
/// Event raised when application is approved
/// </summary>
public class ApplicationApprovedEvent : DomainEvent
{
    public Guid RequestId { get; set; }
    public Guid UserId { get; set; }
    public DateTime ApprovedAt { get; set; }
    public Guid ApprovedBy { get; set; }
}

/// <summary>
/// Event raised when application is rejected
/// </summary>
public class ApplicationRejectedEvent : DomainEvent
{
    public Guid RequestId { get; set; }
    public Guid UserId { get; set; }
    public DateTime RejectedAt { get; set; }
    public Guid RejectedBy { get; set; }
    public string? RejectionReason { get; set; }
}
