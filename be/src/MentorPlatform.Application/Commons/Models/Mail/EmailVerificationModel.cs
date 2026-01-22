
namespace MentorPlatform.Application.Commons.Models.Mail;

public class EmailVerificationModel : EmailAbstractModel
{
    public const int ExpireMinutesDefault = 5;
    public string RecipientName { get; set; } = default!;
    public string Code { get; set; } = default!;
    public int ExpireMinutes { get; set; } = 5;
}
