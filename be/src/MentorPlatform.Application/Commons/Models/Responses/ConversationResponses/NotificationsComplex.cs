using MentorPlatform.Application.Commons.Models.Responses.NotificationResponses;

namespace MentorPlatform.Application.Commons.Models.Responses.ConversationResponses;
public class NotificationsComplex
{
    public NotificationResponse? Notification { get; set; }
    public List<string> UserIds { get; set; }
    public Guid Mentioner { get; set; }
}
