
namespace MentorPlatform.Application.Services.HostedServices;

public interface IBackgroundTaskQueue<T>
{
    ValueTask QueueBackgroundWorkItemAsync(T workItem, CancellationToken cancellationToken = default);

    ValueTask<T> DequeueBackgroundWorkItemAsync(
        CancellationToken cancellationToken = default);
}