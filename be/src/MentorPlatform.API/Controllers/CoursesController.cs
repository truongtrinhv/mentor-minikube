using MentorPlatform.Application.Commons.Models.Requests.CourseRequests;
using MentorPlatform.Application.UseCases.CourseUseCases;
using MentorPlatform.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MentorPlatform.WebApi.Controllers;

[Route("api/courses")]
[Authorize]
public class CoursesController : ApiControllerBase
{
    private readonly ICourseServices _courseService;

    public CoursesController(ICourseServices courseService)
    {
        _courseService = courseService;
    }

    [HttpGet("look-up")]
    public async Task<IActionResult> GetLookupAsync([FromQuery] string? search)
    {
        var result = await _courseService.GetLookupAsync(search);
        return ProcessResult(result);
    }

    [HttpGet]
    public async Task<IActionResult> GetAllAsync([FromQuery] CourseQueryParameters queryParameters)
    {
        var result = await _courseService.GetAllAsync(queryParameters);
        return ProcessResult(result);
    }

    [HttpGet("my-courses")]
    [Authorize(Roles = nameof(Role.Learner))]
    public async Task<IActionResult> GetAllForLearnerAsync([FromQuery] CourseQueryParameters queryParameters)
    {
        var result = await _courseService.GetAllForLearnerAsync(queryParameters);
        return ProcessResult(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetByIdAsync(Guid id)
    {
        var result = await _courseService.GetByIdAsync(id);
        return ProcessResult(result);
    }

    [HttpPost]
    [Authorize(Roles = nameof(Role.Mentor))]
    public async Task<IActionResult> Create(CreateCourseRequest request)
    {
        var result = await _courseService.AddCourseAsync(request);
        return ProcessResult(result);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = nameof(Role.Mentor))]
    public async Task<IActionResult> Edit(Guid id, EditCourseRequest request)
    {
        var result = await _courseService.UpdateCourseAsync(id, request);
        return ProcessResult(result);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = $"{nameof(Role.Mentor)}, {nameof(Role.Admin)}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _courseService.DeleteCourseAsync(id);
        return ProcessResult(result);
    }
}
