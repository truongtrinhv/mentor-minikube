using MentorPlatform.Application.Commons.Models.Requests.ConversationRequests;
using MentorPlatform.Application.Commons.Models.Responses.ConversationResponses;
using MentorPlatform.Application.UseCases.ConversationUseCases;
using MentorPlatform.Domain.Shared;
using MentorPlatform.WebApi.Hubs.TypeInterface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace MentorPlatform.WebApi.Hubs;

[Authorize]
public class LiveHub : Hub<ILiveHub>
{
    private readonly IConversationServices _conversationServices;

    public LiveHub(IConversationServices conversationServices)
    {
        _conversationServices = conversationServices;
    }

    public override async Task OnConnectedAsync()
    {
        var userId = Guid.Parse(Context.UserIdentifier);
        var result = await _conversationServices.GetSyncingData(userId);
        foreach (var conversation in result.Data.Conversations)
        {
            await ConnectToConversation(conversation.Id);
        }
        await Clients.Caller.ReceiveSyncData(result);
        await base.OnConnectedAsync();
    }

    public async Task<Result> CreateConversation(CreateConversationRequest request)
    {
        var userId = Guid.Parse(Context.UserIdentifier);
        var result = await _conversationServices.CreateConversation(userId, request);
        if (!result.IsSuccess)
        {
            return result;
        }

        await ConnectToConversation(result.Data.Id);
        foreach (var participant in result.Data.Participants)
        {
            await Clients.User(participant.Id.ToString()).SyncConversation(result.Data.Id);
        }
        var notificationUsers = result.Data.Participants
            .Where(p => p.Id != userId)
            .Select(p => p.Id.ToString())
            .ToList();
        await Clients.Users(notificationUsers).ReceiveNotification(result.Data.Notification!);
        return Result.Success();
    }

    public async Task<Result> LeaveGroup(Guid conversationId)
    {
        var userId = Guid.Parse(Context.UserIdentifier);
        var result = await _conversationServices.LeaveGroup(userId, conversationId);
        if (!result.IsSuccess)
        {
            return result;
        }
        await DisconnectToConversation(conversationId);
        return Result.Success();
    }

    private async Task ConnectToConversation(Guid conversationId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"Conversation-{conversationId}");
    }

    private async Task DisconnectToConversation(Guid conversationId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"Conversation-{conversationId}");
    }

    public async Task ReadConversation(Guid conversationId)
    {
        var userId = Guid.Parse(Context.UserIdentifier);
        var result = await _conversationServices.MarkConversationAsRead(userId, conversationId);

        if (result.IsSuccess)
        {
            await Clients.Caller.SyncConversation(conversationId);
        }
    }

    public async Task ReadNotification(Guid notificationId)
    {
        var userId = Guid.Parse(Context.UserIdentifier);
        await _conversationServices.MarkNotificationAsRead(userId, notificationId);
    }

    public async Task ReadNotifications(List<Guid> notificationIds)
    {
        var userId = Guid.Parse(Context.UserIdentifier);
        await _conversationServices.MarkNotificationsAsRead(userId, notificationIds);
    }

    public async Task<Result> SendMessage(SendMessageRequest request)
    {
        var userId = Guid.Parse(Context.UserIdentifier);
        var messageResult = await _conversationServices.CreateMessage(userId, request);
        if (!messageResult.IsSuccess)
        {
            return messageResult;
        }
        var notificationResult = await _conversationServices.CreateMentionNotification(userId, request.ConversationId, messageResult.Data);
        await Clients.Group($"Conversation-{request.ConversationId}").ReceiveMessage(request.ConversationId, messageResult.Data);
        if (notificationResult.UserIds.Any())
        {
            await Clients.Users(notificationResult.UserIds).ReceiveNotification(notificationResult.Notification);
        }
        return Result.Success();
    }

    public async Task<Result<ConversationResponse>> SyncConversation(Guid conversationId)
    {
        var userId = Guid.Parse(Context.UserIdentifier);
        var result = await _conversationServices.GetSyncingConversation(userId, conversationId);
        if (!result.IsSuccess)
        {
            return Result<ConversationResponse>.Failure();
        }
        await ConnectToConversation(conversationId);
        return result;
    }

    public async Task<Result<List<UserResponse>>> SearchUser(string keyword)
    {
        var userId = Guid.Parse(Context.UserIdentifier);
        var result = await _conversationServices.SearchUsers(userId, keyword);

        return result;
    }

}