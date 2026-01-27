namespace MentorPlatform.Infrastructure.Messaging.Configuration;

/// <summary>
/// Configuration options for RabbitMQ connection and behavior
/// </summary>
public class RabbitMQOptions
{
    public const string SectionName = "RabbitMQ";

    /// <summary>
    /// RabbitMQ host address
    /// </summary>
    public string Host { get; set; } = "localhost";

    /// <summary>
    /// RabbitMQ port
    /// </summary>
    public int Port { get; set; } = 5672;

    /// <summary>
    /// RabbitMQ virtual host
    /// </summary>
    public string VirtualHost { get; set; } = "/";

    /// <summary>
    /// RabbitMQ username
    /// </summary>
    public string Username { get; set; } = "guest";

    /// <summary>
    /// RabbitMQ password
    /// </summary>
    public string Password { get; set; } = "guest";

    /// <summary>
    /// Prefetch count - number of messages to prefetch from RabbitMQ
    /// </summary>
    public ushort PrefetchCount { get; set; } = 16;

    /// <summary>
    /// Enable SSL/TLS connection
    /// </summary>
    public bool UseSsl { get; set; } = false;

    /// <summary>
    /// Heartbeat interval in seconds
    /// </summary>
    public ushort Heartbeat { get; set; } = 60;

    /// <summary>
    /// Number of retry attempts for failed messages
    /// </summary>
    public int RetryLimit { get; set; } = 3;

    /// <summary>
    /// Initial retry interval in seconds
    /// </summary>
    public int RetryIntervalSeconds { get; set; } = 1;
}
