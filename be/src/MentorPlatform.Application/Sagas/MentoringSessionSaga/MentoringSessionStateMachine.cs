using MassTransit;
using MentorPlatform.Domain.Events;

namespace MentorPlatform.Application.Sagas.MentoringSessionSaga;

/// <summary>
/// Saga state for mentoring session workflow
/// </summary>
public class MentoringSessionSagaState : SagaStateMachineInstance
{
    public Guid CorrelationId { get; set; }
    
    // Saga State
    public string CurrentState { get; set; } = default!;

    // Session Details
    public Guid SessionId { get; set; }
    public Guid LearnerId { get; set; }
    public Guid MentorId { get; set; }
    public Guid ScheduleId { get; set; }
    public Guid CourseId { get; set; }
    public int SessionType { get; set; }

    // Workflow State
    public DateTime CreatedAt { get; set; }
    public DateTime? ScheduleValidatedAt { get; set; }
    public DateTime? NotificationssentAt { get; set; }
    public DateTime? CompletedAt { get; set; }

    // Retry Tracking
    public int RetryCount { get; set; }
    public string? FailureReason { get; set; }
}

/// <summary>
/// Commands for mentoring session saga
/// </summary>
public class ValidateScheduleCommand
{
    public Guid SessionId { get; set; }
    public Guid ScheduleId { get; set; }
    public Guid LearnerId { get; set; }
    public Guid MentorId { get; set; }
}

public class SendSessionNotificationsCommand
{
    public Guid SessionId { get; set; }
    public Guid LearnerId { get; set; }
    public Guid MentorId { get; set; }
}

/// <summary>
/// Events for mentoring session saga
/// </summary>
public class ScheduleValidatedEvent
{
    public Guid SessionId { get; set; }
    public bool IsValid { get; set; }
}

public class NotificationsSentEvent
{
    public Guid SessionId { get; set; }
    public DateTime SentAt { get; set; }
}

/// <summary>
/// Mentoring session state machine
/// </summary>
public class MentoringSessionStateMachine : MassTransitStateMachine<MentoringSessionSagaState>
{
    public State SessionCreated { get; private set; } = default!;
    public State ValidatingSchedule { get; private set; } = default!;
    public State ScheduleValidated { get; private set; } = default!;
    public State SendingNotifications { get; private set; } = default!;
    public State SessionScheduled { get; private set; } = default!;
    public State SessionCancelled { get; private set; } = default!;
    public State SessionCompleted { get; private set; } = default!;

    public Event<MentoringSessionCreatedEvent> SessionCreatedEventTriggered { get; private set; } = default!;
    public Event<ValidateScheduleCommand> ValidateScheduleRequested { get; private set; } = default!;
    public Event<ScheduleValidatedEvent> ScheduleValidationCompleted { get; private set; } = default!;
    public Event<SendSessionNotificationsCommand> SendNotificationsRequested { get; private set; } = default!;
    public Event<NotificationsSentEvent> NotificationsCompleted { get; private set; } = default!;
    public Event<MentoringSessionCancelledEvent> CancellationRequested { get; private set; } = default!;
    public Event<MentoringSessionCompletedEvent> CompletionRequested { get; private set; } = default!;

    public MentoringSessionStateMachine()
    {
        InstanceState(x => x.CurrentState);

        // Initial state when session is created
        Event(() => SessionCreatedEventTriggered, x => x.CorrelateById(m => m.Message.SessionId));

        // Schedule validation
        Event(() => ValidateScheduleRequested, x => x.CorrelateById(m => m.Message.SessionId));
        Event(() => ScheduleValidationCompleted, x => x.CorrelateById(m => m.Message.SessionId));

        // Notifications
        Event(() => SendNotificationsRequested, x => x.CorrelateById(m => m.Message.SessionId));
        Event(() => NotificationsCompleted, x => x.CorrelateById(m => m.Message.SessionId));

        // Terminal events
        Event(() => CancellationRequested, x => x.CorrelateById(m => m.Message.SessionId));
        Event(() => CompletionRequested, x => x.CorrelateById(m => m.Message.SessionId));

        // State machine definition
        Initially(
            When(SessionCreatedEventTriggered)
                .Then(context =>
                {
                    context.Saga.SessionId = context.Message.SessionId;
                    context.Saga.LearnerId = context.Message.LearnerId;
                    context.Saga.MentorId = context.Message.MentorId;
                    context.Saga.ScheduleId = context.Message.ScheduleId;
                    context.Saga.CourseId = context.Message.CourseId;
                    context.Saga.SessionType = context.Message.SessionType;
                    context.Saga.CreatedAt = context.Message.OccurredOn;
                })
                .TransitionTo(ValidatingSchedule)
                .Publish(context => new ValidateScheduleCommand
                {
                    SessionId = context.Saga.SessionId,
                    ScheduleId = context.Saga.ScheduleId,
                    LearnerId = context.Saga.LearnerId,
                    MentorId = context.Saga.MentorId
                })
        );

        During(ValidatingSchedule,
            When(ScheduleValidationCompleted)
                .Then(context =>
                {
                    context.Saga.ScheduleValidatedAt = DateTime.UtcNow;
                })
                .TransitionTo(SendingNotifications)
                .IfElse(context => context.Message.IsValid,
                    binder => binder.Publish(context => new SendSessionNotificationsCommand
                    {
                        SessionId = context.Saga.SessionId,
                        LearnerId = context.Saga.LearnerId,
                        MentorId = context.Saga.MentorId
                    }),
                    binder => binder.TransitionTo(SessionCancelled))
        );

        During(SendingNotifications,
            When(NotificationsCompleted)
                .Then(context =>
                {
                    context.Saga.NotificationssentAt = context.Message.SentAt;
                })
                .TransitionTo(SessionScheduled)
        );

        During(SessionScheduled,
            When(CompletionRequested)
                .TransitionTo(SessionCompleted),
            When(CancellationRequested)
                .TransitionTo(SessionCancelled)
        );

        SetCompletedWhenFinalized();
    }
}
