using MentorPlatform.Application.Commons.Models.Responses.NotificationResponses;

namespace MentorPlatform.Application.Commons.Models.Responses.ConversationResponses;
public class ConversationResponse
{
    public Guid Id { get; set; }
    public string ConversationName { get; set; }
    public bool IsGroup { get; set; }
    public bool HasUnreadMessage { get; set; }

    public NotificationResponse? Notification { get; set; }

    public List<MessageResponse> Messages { get; set; }
    public List<UserResponse> Participants { get; set; }
}
