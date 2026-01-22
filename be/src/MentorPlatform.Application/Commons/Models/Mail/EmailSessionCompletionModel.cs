namespace MentorPlatform.Application.Commons.Models.Mail;

public class EmailSessionCompletionModel : EmailAbstractModel
{
    public string MentorName { get; set; } = "";
    public string CourseName { get; set; } = "";
    public string LearnerName { get; set; } = "";
    public string StartTime { get; set; } = "";
    public string EndTime { get; set; } = "";
    public string SessionTypeName { get; set; } = "";
} 