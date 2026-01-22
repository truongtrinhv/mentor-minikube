using MentorPlatform.Application.Commons.Models.Requests.ConversationRequests;
using MentorPlatform.Application.Identity;
using MentorPlatform.Application.UseCases.ConversationUseCases;
using MentorPlatform.Domain.Shared;
using MentorPlatform.Persistence;
using MentorPlatform.WebApi.Hubs;
using MentorPlatform.WebApi.Hubs.TypeInterface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace MentorPlatform.WebApi.Controllers;

[Route("api/conversations")]
[Authorize]
public class ConversationController : ApiControllerBase
{
    private readonly IConversationServices _conversationServices;
    private readonly IHubContext<LiveHub, ILiveHub> _hubContext;
    private readonly IExecutionContext _executionContext;
    private readonly ApplicationDbContext _context;

    public ConversationController(IConversationServices conversationServices,
        IHubContext<LiveHub, ILiveHub> hubContext,
        IExecutionContext executionContext,
        ApplicationDbContext context)
    {
        _conversationServices = conversationServices;
        _hubContext = hubContext;
        _executionContext = executionContext;
        _context = context;
    }

    [HttpPost("file-message")]
    public async Task<IActionResult> SendMessageWithFile([FromForm] FileMessageRequest request)
    {
        var userId = _executionContext.GetUserId();
        var messageResult = await _conversationServices.CreateMessageWithFile(userId, request);
        if (!messageResult.IsSuccess)
        {
            return ProcessResult(messageResult);
        }
        await _hubContext.Clients.Group($"Conversation-{request.ConversationId}").ReceiveMessage(request.ConversationId, messageResult.Data);
        var notificationResult = await _conversationServices.CreateMentionNotification(userId, request.ConversationId, messageResult.Data);
        if (notificationResult.UserIds.Any())
        {
            await _hubContext.Clients.Users(notificationResult.UserIds).ReceiveNotification(notificationResult.Notification);
        }
        return ProcessResult(Result.Success());
    }
}
