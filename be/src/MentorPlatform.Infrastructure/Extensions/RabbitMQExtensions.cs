using MassTransit;
using MentorPlatform.Application.Sagas.ApplicationRequestSaga;
using MentorPlatform.Application.Sagas.CourseEnrollmentSaga;
using MentorPlatform.Application.Sagas.MentoringSessionSaga;
using MentorPlatform.Application.Services.Messaging;
using MentorPlatform.Infrastructure.Messaging.Configuration;
using MentorPlatform.Infrastructure.Messaging.Consumers;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace MentorPlatform.Infrastructure.Extensions;

/// <summary>
/// Extension methods for configuring MassTransit with RabbitMQ
/// </summary>
public static class RabbitMQExtensions
{
    public static IServiceCollection AddRabbitMQMessageBus(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Configure RabbitMQ options
        var rabbitMQOptions = configuration.GetSection(RabbitMQOptions.SectionName).Get<RabbitMQOptions>() ?? new RabbitMQOptions();
        services.Configure<RabbitMQOptions>(configuration.GetSection(RabbitMQOptions.SectionName));

        // Configure MassTransit with RabbitMQ
        services.AddMassTransit(x =>
        {
            // Add saga state machines for orchestration
            x.AddSagaStateMachine<MentoringSessionStateMachine, MentoringSessionSagaState>()
                .InMemoryRepository(); // Use EF Core or other persistence in production

            x.AddSagaStateMachine<CourseEnrollmentStateMachine, CourseEnrollmentSagaState>()
                .InMemoryRepository();

            x.AddSagaStateMachine<ApplicationRequestStateMachine, ApplicationRequestSagaState>()
                .InMemoryRepository();

            // Register consumers
            x.AddConsumer<ValidateScheduleConsumer>();
            x.AddConsumer<SendSessionNotificationsConsumer>();
            x.AddConsumer<CheckCourseCapacityConsumer>();
            x.AddConsumer<ConfirmEnrollmentConsumer>();
            x.AddConsumer<SendWelcomeEmailConsumer>();
            x.AddConsumer<GrantCourseAccessConsumer>();
            x.AddConsumer<ValidateDocumentsConsumer>();
            x.AddConsumer<RequestBackgroundCheckConsumer>();
            x.AddConsumer<AssignReviewerConsumer>();
            x.AddConsumer<SendApplicationNotificationConsumer>();

            // Configure RabbitMQ transport
            x.UsingRabbitMq((context, cfg) =>
            {
                cfg.Host(rabbitMQOptions.Host, rabbitMQOptions.VirtualHost, h =>
                {
                    h.Username(rabbitMQOptions.Username);
                    h.Password(rabbitMQOptions.Password);
                    if (rabbitMQOptions.UseSsl)
                    {
                        h.UseSsl();
                    }
                });

                // Configure message retry policy
                cfg.UseMessageRetry(r => r.Incremental(
                    retryLimit: rabbitMQOptions.RetryLimit, 
                    initialInterval: TimeSpan.FromSeconds(rabbitMQOptions.RetryIntervalSeconds), 
                    intervalIncrement: TimeSpan.FromSeconds(2)));

                // Configure concurrent message limit
                cfg.PrefetchCount = rabbitMQOptions.PrefetchCount;

                // Configure dead letter exchanges for failed messages
                cfg.UseDelayedRedelivery(r => r.Intervals(
                    TimeSpan.FromMinutes(1),
                    TimeSpan.FromMinutes(5),
                    TimeSpan.FromMinutes(15)));

                // Auto-configure all endpoints
                cfg.ConfigureEndpoints(context);
            });
        });

        return services;
    }

    public static IServiceCollection AddDomainEventDispatcher(this IServiceCollection services)
    {
        services.AddScoped<IDomainEventDispatcher, DomainEventDispatcher>();
        return services;
    }
}

/// <summary>
/// Domain event dispatcher using MassTransit and RabbitMQ
/// </summary>
public class DomainEventDispatcher : IDomainEventDispatcher
{
    private readonly IPublishEndpoint _publishEndpoint;
    private readonly ILogger<DomainEventDispatcher> _logger;

    public DomainEventDispatcher(
        IPublishEndpoint publishEndpoint,
        ILogger<DomainEventDispatcher> logger)
    {
        _publishEndpoint = publishEndpoint;
        _logger = logger;
    }

    public async Task DispatchAsync(MentorPlatform.Domain.Primitives.IDomainEvent domainEvent)
    {
        try
        {
            await _publishEndpoint.Publish(domainEvent, domainEvent.GetType());
            _logger.LogInformation(
                "Domain event {EventType} (ID: {EventId}) published to RabbitMQ", 
                domainEvent.EventType, 
                domainEvent.EventId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, 
                "Failed to publish domain event {EventType} (ID: {EventId})", 
                domainEvent.EventType, 
                domainEvent.EventId);
            throw;
        }
    }

    public async Task DispatchAsync(IEnumerable<MentorPlatform.Domain.Primitives.IDomainEvent> domainEvents)
    {
        var eventList = domainEvents.ToList();
        _logger.LogInformation("Publishing {Count} domain events to RabbitMQ", eventList.Count);
        
        foreach (var domainEvent in eventList)
        {
            await DispatchAsync(domainEvent);
        }
    }
}
