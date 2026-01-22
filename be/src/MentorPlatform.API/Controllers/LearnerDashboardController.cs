using MentorPlatform.Application.UseCases.LearnerDashboardUseCases;
using MentorPlatform.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MentorPlatform.WebApi.Controllers;

[Route("api/learner-dashboard")]
[Authorize(Roles = nameof(Role.Learner))]
public class LearnerDashboardController : ApiControllerBase
{
    private readonly ILearnerDashboardServices _learnerDashboardServices;

    public LearnerDashboardController(ILearnerDashboardServices learnerDashboardServices)
    {
        _learnerDashboardServices = learnerDashboardServices;
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetDashboardStatsAsync()
    {
        var result = await _learnerDashboardServices.GetDashboardStatsAsync();
        return ProcessResult(result);
    }

    [HttpGet("upcoming-sessions")]
    public async Task<IActionResult> GetUpcomingSessionAsync()
    {
        var result = await _learnerDashboardServices.GetUpcomingSessionAsync();
        return ProcessResult(result);
    }

    [HttpGet("enrolled-courses")]
    public async Task<IActionResult> GetEnrolledCoursesAsync()
    {
        var result = await _learnerDashboardServices.GetEnrolledCoursesAsync();
        return ProcessResult(result);
    }
}