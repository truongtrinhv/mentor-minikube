using MentorPlatform.Application.Commons.Models.Query;
using MentorPlatform.Application.UseCases.UserManagement;
using MentorPlatform.Domain.Enums;
using MentorPlatform.WebApi.Hubs;
using MentorPlatform.WebApi.Hubs.TypeInterface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace MentorPlatform.WebApi.Controllers;

[Route("api/users")]
[Authorize(Roles = nameof(Role.Admin))]
public class UserController : ApiControllerBase
{
    private readonly IUserServices _userService;
    private readonly IHubContext<LiveHub, ILiveHub> _hubContext;

    public UserController(IUserServices userService, IHubContext<LiveHub, ILiveHub> hubContext)
    {
        _userService = userService;
        _hubContext = hubContext;
    }

    [HttpGet]
    public async Task<IActionResult> SearchUsersAsync([FromQuery] UserQueryParameters query)
    {
        var result = await _userService.GetUsersByQueryAsync(query);
        return ProcessResult(result);
    }

    [HttpPatch("{userId}/activate")]
    public async Task<IActionResult> ActivateUserAsync([FromRoute] Guid userId)
    {
        var result = await _userService.ChangeUserActiveAsync(userId);
        return ProcessResult(result);
    }

    [HttpPatch("{userId}/deactivate")]
    public async Task<IActionResult> DeactivateUserAsync([FromRoute] Guid userId)
    {
        var result = await _userService.ChangeUserActiveAsync(userId, false);
        await _hubContext.Clients.User(userId.ToString()).RemoveToken();
        return ProcessResult(result);
    }

    [HttpGet("mentors")]
    [AllowAnonymous]
    public async Task<IActionResult> GetAllMentorsAsync([FromQuery] QueryParameters query)
    {
        var result = await _userService.GetAllMentorsAsync(query);
        return ProcessResult(result);
    }
}
