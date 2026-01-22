
using MentorPlatform.Application.Commons.Models.Mail;
using MentorPlatform.Application.Services.Mail;
using MentorPlatform.CrossCuttingConcerns.Exceptions;
using MentorPlatform.CrossCuttingConcerns.Logging;
using MentorPlatform.Domain.Entities;
using MentorPlatform.Domain.Repositories;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using RazorLight;

namespace MentorPlatform.Infrastructure.HostedServices;

public class MentorSessionReminderBackgroundService : BackgroundService
{
    private readonly ILogger<MentorSessionReminderBackgroundService> _logger;
    private readonly IServiceScopeFactory _scopeFactory;

    public MentorSessionReminderBackgroundService(
        ILogger<MentorSessionReminderBackgroundService> logger,
        IServiceScopeFactory scopeFactory)
    {
        _logger = logger;
        _scopeFactory = scopeFactory;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            _logger.LogInformation("Mentor reminder background service running.");
            try
            {
                using var scope = _scopeFactory.CreateScope();

                var sessionRepository = scope.ServiceProvider.GetRequiredService<IMentoringSessionRepository>();

                DateTimeOffset from = DateTimeOffset.Now.AddMinutes(59);
                DateTimeOffset to = from.AddMinutes(2);

                var sessionQueryable = sessionRepository.GetQueryable().Where(ms => ms.Schedule.StartTime >= from && ms.Schedule.StartTime <= to);

                List<MentoringSession> upcomingSessions = await sessionRepository.ToListAsync(
                    sessionQueryable,
                    nameof(MentoringSession.Schedule),
                    $"{nameof(MentoringSession.Schedule)}.{nameof(MentoringSession.Schedule.Mentor)}",
                    $"{nameof(MentoringSession.Schedule)}.{nameof(MentoringSession.Schedule.Mentor)}.{nameof(Schedule.Mentor.UserDetail)}",
                    nameof(MentoringSession.Course),
                    nameof(MentoringSession.Learner),
                    $"{nameof(MentoringSession.Learner)}.{nameof(MentoringSession.Learner.UserDetail)}"
                );

                var razorLightEngine = scope.ServiceProvider.GetRequiredService<IRazorLightEngine>();
                var mailServices = scope.ServiceProvider.GetRequiredService<IApplicationMailServices>();

                var emailTasks = upcomingSessions.Select(s => SendEmailToMentor(s, razorLightEngine, mailServices));
                await Task.WhenAll(emailTasks);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, ApplicationExceptionMessage.ErrorOccuredWhenSendingReminderEmailToMentor);
            }
            finally
            {
                await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
            }
        }

        _logger.LogInformation(ApplicationLoggingMessages.QueueProcessorBackgroundServiceStopped);
    }

    private async Task SendEmailToMentor(MentoringSession session, IRazorLightEngine razorLightEngine, IApplicationMailServices mailServices)
    {
        MentorSessionReminderModel model = new MentorSessionReminderModel()
        {
            StartTime = session.Schedule.StartTime,
            EndTime = session.Schedule.EndTime,
            SessionType = session.SessionType,
            CourseName = session.Course.Title,
            MentorName = session.Schedule.Mentor.UserDetail.FullName,
            LearnerName = session.Learner.UserDetail.FullName
        };

        string mailBody = await razorLightEngine.CompileRenderAsync("Templates.MentorSessionReminderTemplate", model);

        SendMailData mailData = new SendMailData()
        {
            ToEmail = session.Schedule.Mentor.Email,
            Subject = MailInformationConstants.TitleMentorSessionReminderEmail,
            Body = mailBody
        };

        await mailServices.SendMailAsync(mailData);
    }
}
