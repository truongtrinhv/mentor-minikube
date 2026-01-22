
using MailKit.Net.Smtp;
using MailKit.Security;
using MentorPlatform.Application.Commons.Models.Mail;
using MentorPlatform.Application.Services.Mail;
using MentorPlatform.CrossCuttingConcerns.Options;
using Microsoft.Extensions.Options;
using MimeKit;

namespace MentorPlatform.Infrastructure.Emails;

public class ApplicationMailServices : IApplicationMailServices
{
    private readonly EmailSettingsOptions _emailSettings;

    public ApplicationMailServices(IOptions<EmailSettingsOptions> emailSettingsOptions)
    {
        _emailSettings = emailSettingsOptions.Value;
    }

    public async Task SendMailAsync(
        SendMailData sendMailData,
        CancellationToken cancellationToken = default)
    {

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_emailSettings.SenderName, _emailSettings.FromEmail));
        message.To.Add(MailboxAddress.Parse(sendMailData.ToEmail));
        message.Subject = sendMailData.Subject;

        var builder = new BodyBuilder();
        if (sendMailData.IsBodyHtml)
            builder.HtmlBody = sendMailData.Body;
        else
            builder.TextBody = sendMailData.Body;

        message.Body = builder.ToMessageBody();


        using (var client = new SmtpClient())
        {

            await client.ConnectAsync(
                _emailSettings.MailServer,
                _emailSettings.MailPort,
                SecureSocketOptions.StartTlsWhenAvailable
            );

            await client.AuthenticateAsync(
            _emailSettings.FromEmail,
            _emailSettings.Password
            );

            await client.SendAsync(message);
            await client.DisconnectAsync(true);
        }
    }

    public async Task SendMailWithAttachmentAsync(
        SendMailAttachmentData mailAttachmentData,
        CancellationToken cancellationToken = default)
    {

        var message = GetMimeMessage(mailAttachmentData);

        using (var client = await GetSmtpClient())
        {
            await client.SendAsync(message);
            await client.DisconnectAsync(true);
        }
    }

    public async Task<SmtpClient> GetSmtpClient()
    {
        var client = new SmtpClient();
        await client.ConnectAsync(
            _emailSettings.MailServer,
            _emailSettings.MailPort,
            SecureSocketOptions.StartTlsWhenAvailable
        );
        await client.AuthenticateAsync(
            _emailSettings.FromEmail,
            _emailSettings.Password
        );
        return client;
    }

    private MimeMessage GetMimeMessage(SendMailAttachmentData mailAttachmentData)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_emailSettings.SenderName, _emailSettings.FromEmail));
        message.To.Add(MailboxAddress.Parse(mailAttachmentData.ToEmail));
        message.Subject = mailAttachmentData.Subject;

        var builder = new BodyBuilder
        {
            HtmlBody = mailAttachmentData.IsBodyHtml ? mailAttachmentData.Body : null,
            TextBody = mailAttachmentData.IsBodyHtml ? null : mailAttachmentData.Body
        };

        var fileName = mailAttachmentData.FileName;
        var mimeType = mailAttachmentData.MineType;
        var bytes = mailAttachmentData.FileBytes;

        if (bytes != null && bytes.Length > 0)
        {
            builder.Attachments.Add(fileName, bytes, ContentType.Parse(mimeType));
        }
        message.Body = builder.ToMessageBody();

        return message;
    }
}