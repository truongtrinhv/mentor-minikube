
using MentorPlatform.Application.Services.HostedServices;
using MentorPlatform.CrossCuttingConcerns.Exceptions;
using System.Threading.Channels;

namespace MentorPlatform.Infrastructure.HostedServices;

public class BackgroundTaskQueue<T> : IBackgroundTaskQueue<T>
{

    private readonly Channel<T> _queue;
    private const int DefaultCapacity = 100;
    public BackgroundTaskQueue()
    {
        var options = new BoundedChannelOptions(DefaultCapacity)
        {
            FullMode = BoundedChannelFullMode.DropNewest,
        };
        _queue = Channel.CreateBounded<T>(options);
    }
    public ValueTask QueueBackgroundWorkItemAsync(T workItem, CancellationToken cancellationToken = default)
    {
        if (workItem == null!)
        {
            throw new ArgumentException(ApplicationExceptionMessage.BackGroundTaskQueueWorkItemNull);
        }
        return _queue.Writer.WriteAsync(workItem, cancellationToken);
    }
    public ValueTask<T> DequeueBackgroundWorkItemAsync(CancellationToken cancellationToken = default)
    {
        return _queue.Reader.ReadAsync(cancellationToken);
    }


}