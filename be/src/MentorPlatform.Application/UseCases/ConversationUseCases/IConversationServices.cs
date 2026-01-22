using MentorPlatform.Application.Commons.Models.Requests.ConversationRequests;
using MentorPlatform.Application.Commons.Models.Responses.ConversationResponses;
using MentorPlatform.Domain.Shared;

namespace MentorPlatform.Application.UseCases.ConversationUseCases;
public interface IConversationServices
{
    Task<Result<SyncData>> GetSyncingData(Guid userId);
    Task<Result<ConversationResponse>> CreateConversation(Guid userId, CreateConversationRequest request);
    Task<Result<MessageResponse>> CreateMessage(Guid userId, SendMessageRequest request);
    Task<Result<MessageResponse>> CreateMessageWithFile(Guid userId, FileMessageRequest request);
    Task<Result<ConversationResponse>> GetSyncingConversation(Guid userId, Guid conversationId);
    Task<Result<List<UserResponse>>> SearchUsers(Guid userId, string keyword);
    Task<Result> MarkConversationAsRead(Guid userId, Guid conversationId);
    Task<Result> LeaveGroup(Guid userId, Guid conversationId);
    Task<NotificationsComplex> CreateMentionNotification(Guid userId, Guid conversationId, MessageResponse message);
    Task<Result> MarkNotificationAsRead(Guid userId, Guid notificationId);
    Task<Result> MarkNotificationsAsRead(Guid userId, List<Guid> notificationIds);
}
