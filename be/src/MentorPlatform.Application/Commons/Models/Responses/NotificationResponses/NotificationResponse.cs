namespace MentorPlatform.Application.Commons.Models.Responses.NotificationResponses;
public class NotificationResponse
{
    public Guid Id { get; set; }
    public string Title { get; set; }
    public string Message { get; set; }
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }
}
