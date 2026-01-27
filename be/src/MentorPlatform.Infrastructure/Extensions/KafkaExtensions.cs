using System;
using Confluent.Kafka;
using MassTransit;
using MentorPlatform.Application.Sagas.ApplicationRequestSaga;
using MentorPlatform.Application.Sagas.CourseEnrollmentSaga;
using MentorPlatform.Application.Sagas.MentoringSessionSaga;
using MentorPlatform.Infrastructure.Messaging.Configuration;
using MentorPlatform.Infrastructure.Messaging.Consumers;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace MentorPlatform.Infrastructure.Extensions;

/// <summary>
/// Extension methods for configuring MassTransit with Kafka.
/// </summary>
public static class KafkaExtensions
{
    public static IServiceCollection AddKafkaMessageBus(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var kafkaOptions = configuration.GetSection(KafkaOptions.SectionName).Get<KafkaOptions>() ?? new KafkaOptions();
        services.Configure<KafkaOptions>(configuration.GetSection(KafkaOptions.SectionName));

        services.AddMassTransit(x =>
        {
            x.SetKebabCaseEndpointNameFormatter();

            // Saga state machines
            x.AddSagaStateMachine<MentoringSessionStateMachine, MentoringSessionSagaState>()
                .InMemoryRepository();
            x.AddSagaStateMachine<CourseEnrollmentStateMachine, CourseEnrollmentSagaState>()
                .InMemoryRepository();
            x.AddSagaStateMachine<ApplicationRequestStateMachine, ApplicationRequestSagaState>()
                .InMemoryRepository();

            // Consumers
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

            // Base bus for scheduling/mediating internal flows
            x.UsingInMemory((context, cfg) =>
            {
                cfg.ConfigureEndpoints(context);
            });

            // Kafka rider for transport
            x.AddRider(rider =>
            {
                rider.AddConsumer<ValidateScheduleConsumer>();
                rider.AddConsumer<SendSessionNotificationsConsumer>();
                rider.AddConsumer<CheckCourseCapacityConsumer>();
                rider.AddConsumer<ConfirmEnrollmentConsumer>();
                rider.AddConsumer<SendWelcomeEmailConsumer>();
                rider.AddConsumer<GrantCourseAccessConsumer>();
                rider.AddConsumer<ValidateDocumentsConsumer>();
                rider.AddConsumer<RequestBackgroundCheckConsumer>();
                rider.AddConsumer<AssignReviewerConsumer>();
                rider.AddConsumer<SendApplicationNotificationConsumer>();

                rider.UsingKafka((context, k) =>
                {
                    k.Host(kafkaOptions.BootstrapServers);
                    // Endpoint-level configuration can be added with TopicEndpoint<T> when topics are defined.
                });
            });
        });

        return services;
    }
}
