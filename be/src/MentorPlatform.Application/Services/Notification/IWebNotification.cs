namespace MentorPlatform.Application.Services.Notification;

public interface IWebNotification<in T>
{
    Task SendAsync(T message, CancellationToken cancellationToken = default);
}
