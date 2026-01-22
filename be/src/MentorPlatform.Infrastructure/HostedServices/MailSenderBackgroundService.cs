
using MentorPlatform.Application.Services.HostedServices;
using MentorPlatform.CrossCuttingConcerns.Exceptions;
using MentorPlatform.CrossCuttingConcerns.Helpers;
using MentorPlatform.CrossCuttingConcerns.Logging;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace MentorPlatform.Infrastructure.HostedServices;

public class MailSenderBackgroundService : BackgroundService
{
    private readonly IBackgroundTaskQueue<Func<IServiceProvider, CancellationToken, ValueTask>> _queue;
    private readonly ILogger<MailSenderBackgroundService> _logger;
    private readonly IServiceProvider _serviceProvider;
    public MailSenderBackgroundService(ILogger<MailSenderBackgroundService> logger,
        IServiceProvider serviceProvider, IBackgroundTaskQueue<Func<IServiceProvider,
            CancellationToken, ValueTask>> queue)
    {
        _logger = logger;
        _queue = queue;
        _serviceProvider = serviceProvider;
    }


    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            var workItem = await _queue.DequeueBackgroundWorkItemAsync(stoppingToken);

            try
            {
                await workItem(_serviceProvider, stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, StringHelper.ReplacePlaceholders(
                                                ApplicationExceptionMessage.ErrorOccuredExecutionWorkItem,
                                                        nameof(workItem)));
            }

        }
        _logger.LogInformation(ApplicationLoggingMessages.QueueProcessorBackgroundServiceStopped);
    }
}
