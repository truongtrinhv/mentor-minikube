using MentorPlatform.Application.UseCases.AdminDashboardUseCases;
using MentorPlatform.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MentorPlatform.WebApi.Controllers;

[Route("api/admin-dashboard")]
[Authorize(Roles = nameof(Role.Admin))]
public class AdminDashboardController : ApiControllerBase
{
    private readonly IAdminDashboardServices _adminDashboardServices;

    public AdminDashboardController(IAdminDashboardServices adminDashboardServices)
    {
        _adminDashboardServices = adminDashboardServices;
    }

    [HttpGet("user-stats")]
    public async Task<IActionResult> GetUserStatsAsync()
    {
        var result = await _adminDashboardServices.GetUserStatsAsync();
        return ProcessResult(result);
    }

    [HttpGet("course-resource-stats")]
    public async Task<IActionResult> GetCourseStatsAsync()
    {
        var result = await _adminDashboardServices.GetCourseAndResourceStatsAsync();
        return ProcessResult(result);
    }

    [HttpGet("most-popular-courses")]
    public async Task<IActionResult> GetMostPopularCoursesAsync()
    {
        var result = await _adminDashboardServices.GetMostPopularCoursesAsync();
        return ProcessResult(result);
    }

    [HttpGet("session-stats")]
    public async Task<IActionResult> GetSessionStatsAsync()
    {
        var result = await _adminDashboardServices.GetSessionStatsAsync();
        return ProcessResult(result);
    }
}