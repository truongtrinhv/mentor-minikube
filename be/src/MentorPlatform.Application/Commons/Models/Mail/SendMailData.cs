
namespace MentorPlatform.Application.Commons.Models.Mail;

public class SendMailData
{
    public string ToEmail { get; set; } = default!;
    public string Subject { get; set; } = default!;
    public string Body { get; set; } = default!;
    public bool IsBodyHtml { get; set; } = true;
}


public class SendMailAttachmentData : SendMailData
{
    public byte[]? FileBytes { get; set; } = default;
    public string MineType { get; set; } = default!;
    public string FileName { get; set; } = default!;
}
