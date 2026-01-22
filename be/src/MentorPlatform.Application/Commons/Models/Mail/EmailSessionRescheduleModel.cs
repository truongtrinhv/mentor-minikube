namespace MentorPlatform.Application.Commons.Models.Mail;

public class EmailSessionRescheduleModel : EmailAbstractModel
{
    public string MentorName { get; set; } = "";
    public string CourseName { get; set; } = "";
    public string LearnerName { get; set; } = "";
    public string OldStartTime { get; set; } = "";
    public string OldEndTime { get; set; } = "";
    public string NewStartTime { get; set; } = "";
    public string NewEndTime { get; set; } = "";
    public string SessionTypeName { get; set; } = "";
    public string Notes { get; set; } = "";
} 