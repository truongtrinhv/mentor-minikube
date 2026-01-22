using MentorPlatform.Application.Commons.Models.Query;
using MentorPlatform.Application.Commons.Models.Requests.MentoringSessionRequest;
using MentorPlatform.Application.UseCases.MentoringSessionUseCases;
using MentorPlatform.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MentorPlatform.WebApi.Controllers;

[Route("api/mentoring-sessions")]
[Authorize]
public class MentoringSessionsController : ApiControllerBase
{
    private readonly IMentoringSessionServices _mentoringSessionServices;

    public MentoringSessionsController(IMentoringSessionServices mentoringSessionServices)
    {
        _mentoringSessionServices = mentoringSessionServices;
    }

    [HttpGet("available-schedules")]
    public async Task<IActionResult> GetAllAsync([FromQuery] ScheduleQueryParameters queryParameters)
    {
        var result = await _mentoringSessionServices.GetAvailableSchedulesAsync(queryParameters);
        return ProcessResult(result);
    }

    [HttpPost]
    [Authorize(Roles = nameof(Role.Learner))]
    public async Task<IActionResult> CreateAsync([FromBody] CreateSessionRequest sessionRequest)
    {
        var result = await _mentoringSessionServices.CreateAsync(sessionRequest);
        return ProcessResult(result);
    }

    [HttpGet]
    [Authorize(Roles = $"{nameof(Role.Learner)},{nameof(Role.Mentor)}")]
    public async Task<IActionResult> GetAllMentoringSessionsAsync([FromQuery] MentoringSessionParameters query)
    {
        var result = await _mentoringSessionServices.GetAllMentoringSessionsAsync(query);
        return ProcessResult(result);
    }

    [HttpPost("{id}/approve")]
    [Authorize(Roles = $"{nameof(Role.Learner)},{nameof(Role.Mentor)}")]
    public async Task<IActionResult> ApproveAsync(Guid id)
    {
        var result = await _mentoringSessionServices.ApproveAsync(id);
        return ProcessResult(result);
    }

    [HttpPost("{id}/reject")]
    [Authorize(Roles = nameof(Role.Learner))]
    public async Task<IActionResult> RejectAsync(Guid id)
    {
        var result = await _mentoringSessionServices.RejectAsync(id);
        return ProcessResult(result);
    }

    [HttpPost("{id}/reschedule")]
    [Authorize(Roles = nameof(Role.Mentor))]
    public async Task<IActionResult> RescheduleAsync(Guid id, [FromBody] RescheduleSessionRequest request)
    {
        var result = await _mentoringSessionServices.RescheduleAsync(id, request);
        return ProcessResult(result);
    }

    [HttpPost("{id}/complete")]
    [Authorize(Roles = nameof(Role.Mentor))]
    public async Task<IActionResult> CompleteAsync(Guid id)
    {
        var result = await _mentoringSessionServices.CompleteAsync(id);
        return ProcessResult(result);
    }
}
