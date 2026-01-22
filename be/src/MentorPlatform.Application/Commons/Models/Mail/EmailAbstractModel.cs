namespace MentorPlatform.Application.Commons.Models.Mail;

public abstract class EmailAbstractModel
{
    public string SupportEmail { get; set; } = "mentor-connect.support@mentorconnect.com";
    public string AppName { get; set; } = "MentorPlatform";
}
