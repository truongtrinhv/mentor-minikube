using MentorPlatform.Application.Commons.Models.Responses.NotificationResponses;

namespace MentorPlatform.Application.Commons.Models.Responses.ConversationResponses;
public class SyncData
{
    public List<ConversationResponse> Conversations { get; set; }
    public List<NotificationResponse> Notifications { get; set; }
}
