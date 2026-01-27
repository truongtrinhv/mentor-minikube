using MentorPlatform.Domain.Primitives;

namespace MentorPlatform.Domain.Events;

/// <summary>
/// Event raised when a user enrolls in a course
/// </summary>
public class CourseEnrolledEvent : DomainEvent
{
    public Guid EnrollmentId { get; set; }
    public Guid UserId { get; set; }
    public Guid CourseId { get; set; }
    public DateTime EnrolledAt { get; set; }
}

/// <summary>
/// Event raised when enrollment is confirmed
/// </summary>
public class EnrollmentConfirmedEvent : DomainEvent
{
    public Guid EnrollmentId { get; set; }
    public Guid UserId { get; set; }
    public Guid CourseId { get; set; }
}

/// <summary>
/// Event raised when course capacity is exceeded
/// </summary>
public class CourseCapacityExceededEvent : DomainEvent
{
    public Guid CourseId { get; set; }
    public int CurrentEnrollment { get; set; }
    public int MaxCapacity { get; set; }
}

/// <summary>
/// Event raised when access is granted to a course
/// </summary>
public class CourseAccessGrantedEvent : DomainEvent
{
    public Guid EnrollmentId { get; set; }
    public Guid UserId { get; set; }
    public Guid CourseId { get; set; }
    public DateTime GrantedAt { get; set; }
}
