namespace MentorPlatform.Application.Services.Messaging;

/// <summary>
/// Interface for dispatching domain events via message bus
/// </summary>
public interface IDomainEventDispatcher
{
    /// <summary>
    /// Dispatch a single domain event
    /// </summary>
    Task DispatchAsync(MentorPlatform.Domain.Primitives.IDomainEvent domainEvent);

    /// <summary>
    /// Dispatch multiple domain events
    /// </summary>
    Task DispatchAsync(IEnumerable<MentorPlatform.Domain.Primitives.IDomainEvent> domainEvents);
}
