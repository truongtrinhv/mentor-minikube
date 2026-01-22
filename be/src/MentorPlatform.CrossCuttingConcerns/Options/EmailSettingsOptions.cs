
namespace MentorPlatform.CrossCuttingConcerns.Options;

public class EmailSettingsOptions
{
    public string MailServer { get; set; } = default!;
    public int MailPort { get; set; } = default!;
    public string SenderName { get; set; } = default!;
    public string FromEmail { get; set; } = default!;
    public string Password { get; set; } = default!;

}