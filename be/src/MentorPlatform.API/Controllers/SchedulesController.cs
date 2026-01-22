using MentorPlatform.Application.Commons.Models.Query;
using MentorPlatform.Application.Commons.Models.Requests.ScheduleRequests;
using MentorPlatform.Application.UseCases.ScheduleUseCases;
using MentorPlatform.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MentorPlatform.WebApi.Controllers;

[Route("api/schedules")]
[Authorize]
public class SchedulesController : ApiControllerBase
{
    private readonly IScheduleServices _scheduleServices;

    public SchedulesController(IScheduleServices scheduleServices)
    {
        _scheduleServices = scheduleServices;
    }

    [HttpGet]
    [Authorize(Roles = nameof(Role.Mentor))]
    public async Task<IActionResult> GetSchedules([FromQuery] ScheduleQueryParameters queryParameters)
    {
        var result = await _scheduleServices.GetSchedulesAsync(queryParameters);
        return ProcessResult(result);
    }

    [HttpPost]
    [Authorize(Roles = nameof(Role.Mentor))]
    public async Task<IActionResult> Create(CreateScheduleRequest request)
    {
        var result = await _scheduleServices.AddScheduleAsync(request);
        return ProcessResult(result);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = nameof(Role.Mentor))]
    public async Task<IActionResult> Update(Guid id, EditScheduleRequest request)
    {
        var result = await _scheduleServices.UpdateScheduleAsync(id, request);
        return ProcessResult(result);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = nameof(Role.Mentor))]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _scheduleServices.DeleteScheduleAsync(id);
        return ProcessResult(result);
    }
}
