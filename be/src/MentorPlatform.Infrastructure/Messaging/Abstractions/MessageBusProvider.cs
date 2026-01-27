using System;
using MentorPlatform.Infrastructure.Extensions;
using MentorPlatform.Infrastructure.Messaging.Configuration;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace MentorPlatform.Infrastructure.Messaging.Abstractions;

/// <summary>
/// Factory helpers for configuring the message bus transport.
/// </summary>
public static class MessageBusProvider
{
    public enum TransportType
    {
        RabbitMQ,
        Kafka,
        Both
    }

    public static IServiceCollection AddConfiguredMessageBus(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var options = configuration.GetSection(MessageBusOptions.SectionName).Get<MessageBusOptions>()
                      ?? new MessageBusOptions();

        var transport = ParseTransport(options.TransportType);

        switch (transport)
        
        {
            case TransportType.Kafka:
                services.AddKafkaMessageBus(configuration);
                break;
            case TransportType.Both:
                // Default to RabbitMQ for now; rider-based Kafka can be added alongside if needed
                services.AddRabbitMQMessageBus(configuration);
                break;
            case TransportType.RabbitMQ:
            default:
                services.AddRabbitMQMessageBus(configuration);
                break;
        }

        services.AddDomainEventDispatcher();
        return services;
    }

    public static TransportType ParseTransport(string? value)
    {
        return Enum.TryParse<TransportType>(value, true, out var parsed)
            ? parsed
            : TransportType.RabbitMQ;
    }

    public static string GetServiceTransport(IConfiguration configuration, string serviceName)
    {
        var routingValue = configuration.GetSection($"{MessageBusOptions.SectionName}:ServiceTransportRouting:{serviceName}").Value;
        return string.IsNullOrWhiteSpace(routingValue) ? "RabbitMQ" : routingValue;
    }
}
