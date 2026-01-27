using MassTransit;
using MentorPlatform.Domain.Events;

namespace MentorPlatform.Application.Sagas.ApplicationRequestSaga;

/// <summary>
/// Saga state for application request workflow
/// </summary>
public class ApplicationRequestSagaState : SagaStateMachineInstance
{
    public Guid CorrelationId { get; set; }

    // Saga State
    public string CurrentState { get; set; } = default!;

    // Request Details
    public Guid RequestId { get; set; }
    public Guid UserId { get; set; }

    // Workflow State
    public DateTime CreatedAt { get; set; }
    public DateTime? DocumentsValidatedAt { get; set; }
    public DateTime? BackgroundCheckCompletedAt { get; set; }
    public DateTime? ReviewerAssignedAt { get; set; }
    public DateTime? ReviewCompletedAt { get; set; }
    public DateTime? CompletedAt { get; set; }

    // Tracking
    public Guid? AssignedReviewerId { get; set; }
    public int ReviewStatus { get; set; }

    // Retry Tracking
    public int RetryCount { get; set; }
    public string? FailureReason { get; set; }
}

/// <summary>
/// Commands for application request saga
/// </summary>
public class ValidateDocumentsCommand
{
    public Guid RequestId { get; set; }
    public Guid UserId { get; set; }
}

public class RequestBackgroundCheckCommand
{
    public Guid RequestId { get; set; }
    public Guid UserId { get; set; }
}

public class AssignReviewerCommand
{
    public Guid RequestId { get; set; }
    public Guid UserId { get; set; }
}

public class SendApplicationNotificationCommand
{
    public Guid RequestId { get; set; }
    public Guid UserId { get; set; }
    public int Status { get; set; }
}

/// <summary>
/// Application request state machine
/// </summary>
public class ApplicationRequestStateMachine : MassTransitStateMachine<ApplicationRequestSagaState>
{
    public State ApplicationSubmitted { get; private set; } = default!;
    public State ValidatingDocuments { get; private set; } = default!;
    public State DocumentsValidated { get; private set; } = default!;
    public State RequestingBackgroundCheck { get; private set; } = default!;
    public State BackgroundCheckCompleted { get; private set; } = default!;
    public State AssigningReviewer { get; private set; } = default!;
    public State UnderReview { get; private set; } = default!;
    public State ApplicationApproved { get; private set; } = default!;
    public State ApplicationRejected { get; private set; } = default!;
    public State SendingNotification { get; private set; } = default!;
    public State ApplicationCompleted { get; private set; } = default!;

    public Event<ApplicationRequestSubmittedEvent>? SubmissionEvent { get; private set; }
    public Event<ValidateDocumentsCommand>? ValidateDocsRequested { get; private set; }
    public Event<DocumentsValidatedEvent>? DocumentsValidationCompleted { get; private set; }
    public Event<RequestBackgroundCheckCommand>? BackgroundCheckRequested { get; private set; }
    public Event<BackgroundCheckCompletedEvent>? BackgroundCheckFinished { get; private set; }
    public Event<AssignReviewerCommand>? ReviewerAssignmentRequested { get; private set; }
    public Event<ReviewerAssignedEvent>? ReviewerAssigned { get; private set; }
    public Event<ApplicationApprovedEvent>? ApprovalEvent { get; private set; }
    public Event<ApplicationRejectedEvent>? RejectionEvent { get; private set; }
    public Event<SendApplicationNotificationCommand>? NotificationRequested { get; private set; }

    public ApplicationRequestStateMachine()
    {
        InstanceState(x => x.CurrentState);

        Event(() => SubmissionEvent, x => x.CorrelateById(m => m.Message.RequestId));
        Event(() => ValidateDocsRequested, x => x.CorrelateById(m => m.Message.RequestId));
        Event(() => DocumentsValidationCompleted, x => x.CorrelateById(m => m.Message.RequestId));
        Event(() => BackgroundCheckRequested, x => x.CorrelateById(m => m.Message.RequestId));
        Event(() => BackgroundCheckFinished, x => x.CorrelateById(m => m.Message.RequestId));
        Event(() => ReviewerAssignmentRequested, x => x.CorrelateById(m => m.Message.RequestId));
        Event(() => ReviewerAssigned, x => x.CorrelateById(m => m.Message.RequestId));
        Event(() => ApprovalEvent, x => x.CorrelateById(m => m.Message.RequestId));
        Event(() => RejectionEvent, x => x.CorrelateById(m => m.Message.RequestId));
        Event(() => NotificationRequested, x => x.CorrelateById(m => m.Message.RequestId));

        Initially(
            When(SubmissionEvent)
                .Then(context =>
                {
                    context.Saga.RequestId = context.Message.RequestId;
                    context.Saga.UserId = context.Message.UserId;
                    context.Saga.CreatedAt = context.Message.SubmittedAt;
                })
                .TransitionTo(ValidatingDocuments)
                .Publish(context => new ValidateDocumentsCommand
                {
                    RequestId = context.Saga.RequestId,
                    UserId = context.Saga.UserId
                })
        );

        During(ValidatingDocuments,
            When(DocumentsValidationCompleted)
                .Then(context =>
                {
                    context.Saga.DocumentsValidatedAt = DateTime.UtcNow;
                })
                .TransitionTo(DocumentsValidated)
                .IfElse(context => context.Message.IsValid,
                    binder => binder.TransitionTo(RequestingBackgroundCheck)
                        .Publish(context => new RequestBackgroundCheckCommand
                        {
                            RequestId = context.Saga.RequestId,
                            UserId = context.Saga.UserId
                        }),
                    binder => binder.TransitionTo(ApplicationRejected))
        );

        During(RequestingBackgroundCheck,
            When(BackgroundCheckFinished)
                .Then(context =>
                {
                    context.Saga.BackgroundCheckCompletedAt = DateTime.UtcNow;
                })
                .TransitionTo(BackgroundCheckCompleted)
                .IfElse(context => context.Message.Passed,
                    binder => binder.TransitionTo(AssigningReviewer)
                        .Publish(context => new AssignReviewerCommand
                        {
                            RequestId = context.Saga.RequestId,
                            UserId = context.Saga.UserId
                        }),
                    binder => binder.TransitionTo(ApplicationRejected))
        );

        During(AssigningReviewer,
            When(ReviewerAssigned)
                .Then(context =>
                {
                    context.Saga.AssignedReviewerId = context.Message.ReviewerId;
                    context.Saga.ReviewerAssignedAt = context.Message.AssignedAt;
                })
                .TransitionTo(UnderReview)
        );

        During(UnderReview,
            When(ApprovalEvent)
                .Then(context =>
                {
                    context.Saga.ReviewStatus = 1; // Approved
                    context.Saga.ReviewCompletedAt = context.Message.ApprovedAt;
                })
                .TransitionTo(ApplicationApproved)
                .TransitionTo(SendingNotification)
                .Publish(context => new SendApplicationNotificationCommand
                {
                    RequestId = context.Saga.RequestId,
                    UserId = context.Saga.UserId,
                    Status = 1
                }),
            When(RejectionEvent)
                .Then(context =>
                {
                    context.Saga.ReviewStatus = 2; // Rejected
                    context.Saga.ReviewCompletedAt = context.Message.RejectedAt;
                })
                .TransitionTo(ApplicationRejected)
                .TransitionTo(SendingNotification)
                .Publish(context => new SendApplicationNotificationCommand
                {
                    RequestId = context.Saga.RequestId,
                    UserId = context.Saga.UserId,
                    Status = 2
                })
        );

        During(SendingNotification,
            When(ApprovalEvent)
                .Then(context =>
                {
                    context.Saga.CompletedAt = DateTime.UtcNow;
                })
                .TransitionTo(ApplicationCompleted),
            When(RejectionEvent)
                .Then(context =>
                {
                    context.Saga.CompletedAt = DateTime.UtcNow;
                })
                .TransitionTo(ApplicationCompleted)
        );

        SetCompletedWhenFinalized();
    }
}
