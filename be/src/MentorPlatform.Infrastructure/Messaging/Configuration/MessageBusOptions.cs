using System.Collections.Generic;

namespace MentorPlatform.Infrastructure.Messaging.Configuration;

/// <summary>
/// Options for selecting and routing message bus transports.
/// </summary>
public class MessageBusOptions
{
    public const string SectionName = "MessageBus";

    /// <summary>
    /// TransportType can be RabbitMQ, Kafka, or Both.
    /// </summary>
    public string TransportType { get; set; } = "RabbitMQ";

    public bool EnableRabbitMQ { get; set; } = true;
    public bool EnableKafka { get; set; } = false;

    /// <summary>
    /// Service-level routing preference (e.g., MentoringSession => Kafka).
    /// </summary>
    public Dictionary<string, string> ServiceTransportRouting { get; set; } = new()
    {
        { "MentoringSession", "RabbitMQ" },
        { "CourseEnrollment", "RabbitMQ" },
        { "ApplicationRequest", "RabbitMQ" },
        { "Email", "RabbitMQ" },
        { "Notification", "RabbitMQ" },
        { "Cache", "RabbitMQ" }
    };
}
