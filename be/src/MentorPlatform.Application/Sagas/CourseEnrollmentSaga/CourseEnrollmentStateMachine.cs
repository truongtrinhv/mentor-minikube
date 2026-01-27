using MassTransit;
using MentorPlatform.Domain.Events;

namespace MentorPlatform.Application.Sagas.CourseEnrollmentSaga;

/// <summary>
/// Saga state for course enrollment workflow
/// </summary>
public class CourseEnrollmentSagaState : SagaStateMachineInstance
{
    public Guid CorrelationId { get; set; }

    // Saga State
    public string CurrentState { get; set; } = default!;

    // Enrollment Details
    public Guid EnrollmentId { get; set; }
    public Guid UserId { get; set; }
    public Guid CourseId { get; set; }

    // Workflow State
    public DateTime CreatedAt { get; set; }
    public DateTime? CapacityCheckedAt { get; set; }
    public DateTime? ConfirmedAt { get; set; }
    public DateTime? AccessGrantedAt { get; set; }
    public DateTime? CompletedAt { get; set; }

    // Retry Tracking
    public int RetryCount { get; set; }
    public string? FailureReason { get; set; }
}

/// <summary>
/// Commands for course enrollment saga
/// </summary>
public class CheckCourseCapacityCommand
{
    public Guid EnrollmentId { get; set; }
    public Guid CourseId { get; set; }
    public Guid UserId { get; set; }
}

public class ConfirmEnrollmentCommand
{
    public Guid EnrollmentId { get; set; }
    public Guid UserId { get; set; }
    public Guid CourseId { get; set; }
}

public class SendWelcomeEmailCommand
{
    public Guid EnrollmentId { get; set; }
    public Guid UserId { get; set; }
    public Guid CourseId { get; set; }
}

public class GrantCourseAccessCommand
{
    public Guid EnrollmentId { get; set; }
    public Guid UserId { get; set; }
    public Guid CourseId { get; set; }
}

/// <summary>
/// Events for course enrollment saga
/// </summary>
public class CourseCapacityCheckedEvent
{
    public Guid EnrollmentId { get; set; }
    public bool HasCapacity { get; set; }
}

public class WelcomeEmailSentEvent
{
    public Guid EnrollmentId { get; set; }
    public DateTime SentAt { get; set; }
}

/// <summary>
/// Course enrollment state machine
/// </summary>
public class CourseEnrollmentStateMachine : MassTransitStateMachine<CourseEnrollmentSagaState>
{
    public State EnrollmentInitiated { get; private set; } = default!;
    public State CheckingCapacity { get; private set; } = default!;
    public State CapacityConfirmed { get; private set; } = default!;
    public State ConfirmingEnrollment { get; private set; } = default!;
    public State EnrollmentConfirmed { get; private set; } = default!;
    public State SendingWelcomeEmail { get; private set; } = default!;
    public State GrantingAccess { get; private set; } = default!;
    public State EnrollmentCompleted { get; private set; } = default!;
    public State EnrollmentFailed { get; private set; } = default!;

    public Event<CourseEnrolledEvent> EnrollmentRequestedEvent { get; private set; } = default!;
    public Event<CheckCourseCapacityCommand> CheckCapacityRequested { get; private set; } = default!;
    public Event<CourseCapacityCheckedEvent> CapacityCheckCompleted { get; private set; } = default!;
    public Event<ConfirmEnrollmentCommand> ConfirmationRequested { get; private set; } = default!;
    public Event<EnrollmentConfirmedEvent> ConfirmationCompleted { get; private set; } = default!;
    public Event<SendWelcomeEmailCommand> EmailRequested { get; private set; } = default!;
    public Event<WelcomeEmailSentEvent> EmailCompleted { get; private set; } = default!;
    public Event<GrantCourseAccessCommand> AccessRequested { get; private set; } = default!;
    public Event<CourseAccessGrantedEvent> AccessGranted { get; private set; } = default!;

    public CourseEnrollmentStateMachine()
    {
        InstanceState(x => x.CurrentState);

        Event(() => EnrollmentRequestedEvent, x => x.CorrelateById(m => m.Message.EnrollmentId));
        Event(() => CheckCapacityRequested, x => x.CorrelateById(m => m.Message.EnrollmentId));
        Event(() => CapacityCheckCompleted, x => x.CorrelateById(m => m.Message.EnrollmentId));
        Event(() => ConfirmationRequested, x => x.CorrelateById(m => m.Message.EnrollmentId));
        Event(() => ConfirmationCompleted, x => x.CorrelateById(context => context.Message.EnrollmentId));
        Event(() => EmailRequested, x => x.CorrelateById(context => context.Message.EnrollmentId));
        Event(() => EmailCompleted, x => x.CorrelateById(context => context.Message.EnrollmentId));
        Event(() => AccessRequested, x => x.CorrelateById(context => context.Message.EnrollmentId));
        Event(() => AccessGranted, x => x.CorrelateById(context => context.Message.EnrollmentId));

        Initially(
            When(EnrollmentRequestedEvent)
                .Then(context =>
                {
                    context.Saga.EnrollmentId = context.Message.EnrollmentId;
                    context.Saga.UserId = context.Message.UserId;
                    context.Saga.CourseId = context.Message.CourseId;
                    context.Saga.CreatedAt = context.Message.EnrolledAt;
                })
                .TransitionTo(CheckingCapacity)
                .Publish(context => new CheckCourseCapacityCommand
                {
                    EnrollmentId = context.Saga.EnrollmentId,
                    CourseId = context.Saga.CourseId,
                    UserId = context.Saga.UserId
                })
        );

        During(CheckingCapacity,
            When(CapacityCheckCompleted)
                .Then(context =>
                {
                    context.Saga.CapacityCheckedAt = DateTime.UtcNow;
                })
                .TransitionTo(CapacityConfirmed)
                .IfElse(context => context.Message.HasCapacity,
                    binder => binder.TransitionTo(ConfirmingEnrollment)
                        .Publish(context => new ConfirmEnrollmentCommand
                        {
                            EnrollmentId = context.Saga.EnrollmentId,
                            UserId = context.Saga.UserId,
                            CourseId = context.Saga.CourseId
                        }),
                    binder => binder.TransitionTo(EnrollmentFailed))
        );

        During(ConfirmingEnrollment,
            When(ConfirmationCompleted)
                .Then(context =>
                {
                    context.Saga.ConfirmedAt = DateTime.UtcNow;
                })
                .TransitionTo(EnrollmentConfirmed)
                .TransitionTo(SendingWelcomeEmail)
                .Publish(context => new SendWelcomeEmailCommand
                {
                    EnrollmentId = context.Saga.EnrollmentId,
                    UserId = context.Saga.UserId,
                    CourseId = context.Saga.CourseId
                })
        );

        During(SendingWelcomeEmail,
            When(EmailCompleted)
                .Then(context =>
                {
                    context.Saga.AccessGrantedAt = context.Message.SentAt;
                })
                .TransitionTo(GrantingAccess)
                .Publish(context => new GrantCourseAccessCommand
                {
                    EnrollmentId = context.Saga.EnrollmentId,
                    UserId = context.Saga.UserId,
                    CourseId = context.Saga.CourseId
                })
        );

        During(GrantingAccess,
            When(AccessGranted)
                .Then(context =>
                {
                    context.Saga.CompletedAt = DateTime.UtcNow;
                })
                .TransitionTo(EnrollmentCompleted)
        );

        SetCompletedWhenFinalized();
    }
}
