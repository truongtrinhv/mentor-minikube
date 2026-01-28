using MassTransit;
using Microsoft.Extensions.Logging;

namespace MentorPlatform.Infrastructure.Messaging.Consumers;

/// <summary>
/// Base class for saga consumers providing common logging and error handling
/// </summary>
public abstract class SagaConsumerBase<TMessage> : IConsumer<TMessage> where TMessage : class
{
    protected readonly ILogger<SagaConsumerBase<TMessage>> Logger;

    protected SagaConsumerBase(ILogger<SagaConsumerBase<TMessage>> logger)
    {
        Logger = logger;
    }

    public abstract Task Consume(ConsumeContext<TMessage> context);

    /// <summary>
    /// Handles consumer errors and logs them appropriately
    /// </summary>
    protected void LogConsumerError(Exception ex, string operationName, object operationId)
    {
        Logger.LogError(ex, "Error in {OperationName} for {OperationId}", operationName, operationId);
    }

    /// <summary>
    /// Handles consumer info logging
    /// </summary>
    protected void LogConsumerInfo(string message, params object?[] args)
    {
        Logger.LogInformation(message, args);
    }
}
