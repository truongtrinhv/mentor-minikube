using System.Collections.Generic;

namespace MentorPlatform.Infrastructure.Messaging.Configuration;

/// <summary>
/// Configuration options for Kafka broker connection and behavior.
/// </summary>
public class KafkaOptions
{
    public const string SectionName = "Kafka";

    public string BootstrapServers { get; set; } = "localhost:9092";
    public string GroupId { get; set; } = "mentor-platform-consumer-group";

    public bool UseSasl { get; set; } = false;
    public string SaslMechanism { get; set; } = "PLAIN";
    public string SaslUsername { get; set; } = string.Empty;
    public string SaslPassword { get; set; } = string.Empty;

    public bool UseSsl { get; set; } = false;

    public int NumPartitions { get; set; } = 3;
    public int ReplicationFactor { get; set; } = 1;
    public string CompressionType { get; set; } = "snappy";
    public long RetentionMs { get; set; } = -1;

    public int RetryLimit { get; set; } = 3;
    public int RetryIntervalMs { get; set; } = 1000;
}
