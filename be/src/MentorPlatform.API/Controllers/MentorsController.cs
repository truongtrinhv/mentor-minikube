using MentorPlatform.Application.Commons.Models.Requests.MentorRequests;
using MentorPlatform.Application.UseCases.MentorUseCases;
using MentorPlatform.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MentorPlatform.WebApi.Controllers;

[Route("api/mentors")]
[Authorize]
public class MentorsController : ApiControllerBase
{
    private readonly IMentorServices _mentorService;

    public MentorsController(IMentorServices mentorService)
    {
        _mentorService = mentorService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllMentorsWithCoursesAsync([FromQuery] MentorQueryParameters queryParameters)
    {
        var result = await _mentorService.GetAllMentorsWithCoursesAsync(queryParameters);
        return ProcessResult(result);
    }

    [HttpGet("top-courses")]
    [Authorize(Roles = nameof(Role.Mentor))]
    public async Task<IActionResult> GetTopCourses([FromQuery] int courseNumber = 5)
    {
        var result = await _mentorService.GetTopMentorCourses(courseNumber);
        return ProcessResult(result);
    }

    [HttpGet("upcoming-sessions")]
    [Authorize(Roles = nameof(Role.Mentor))]
    public async Task<IActionResult> GetUpcomingSessions([FromQuery] int sessionNumber = 5)
    {
        var result = await _mentorService.GetUpcomingSessions(sessionNumber);
        return ProcessResult(result);
    }

    [HttpGet("notifications")]
    [Authorize(Roles = nameof(Role.Mentor))]
    public async Task<IActionResult> GetNotifications([FromQuery] int sessionNumber = 5)
    {
        var result = await _mentorService.GetNotifications(sessionNumber);
        return ProcessResult(result);
    }
}