using MentorPlatform.Application.Commons.Models.Responses.ConversationResponses;
using MentorPlatform.Application.Commons.Models.Responses.NotificationResponses;
using MentorPlatform.Domain.Shared;

namespace MentorPlatform.WebApi.Hubs.TypeInterface;

public interface ILiveHub
{
    Task ReceiveSyncData(Result<SyncData> data);
    Task SyncConversation(Guid conversationId);
    Task ReceiveMessage(Guid conversationId, MessageResponse message);
    Task ReceiveNotification(NotificationResponse response);
    Task RemoveToken();
}
