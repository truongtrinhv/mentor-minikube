using MentorPlatform.Application.Commons.Models.Query;
using MentorPlatform.Application.Commons.Models.Requests.CourseCategoryRequests;
using MentorPlatform.Application.UseCases.CourseCategoryUseCases;
using MentorPlatform.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MentorPlatform.WebApi.Controllers;

[Route("api/course-categories")]
[Authorize(Roles = nameof(Role.Admin))]
public class CourseCategoriesController : ApiControllerBase
{
    private readonly ICourseCategoryServices _courseCategoryService;

    public CourseCategoriesController(ICourseCategoryServices courseCategoryService)
    {
        _courseCategoryService = courseCategoryService;
    }

    [HttpGet("look-up")]
    [AllowAnonymous]
    public async Task<IActionResult> GetLookupAsync()
    {
        var result = await _courseCategoryService.GetLookupAsync();
        return ProcessResult(result);
    }

    [HttpGet]
    public async Task<IActionResult> GetAllAsync([FromQuery] QueryParameters queryParameters)
    {
        var result = await _courseCategoryService.GetAllAsync(queryParameters);
        return ProcessResult(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetByIdAsync(Guid id)
    {
        var result = await _courseCategoryService.GetByIdAsync(id);
        return ProcessResult(result);
    }

    [HttpPost]
    public async Task<IActionResult> CreateAsync([FromBody] CreateCourseCategoryRequest createRequest)
    {
        var result = await _courseCategoryService.CreateAsync(createRequest);
        return ProcessResult(result);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = nameof(Role.Admin))]
    public async Task<IActionResult> UpdateAsync(Guid id, [FromBody] UpdateCourseCategoryRequest updateRequest)
    {
        var result = await _courseCategoryService.UpdateAsync(id, updateRequest);
        return ProcessResult(result);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = nameof(Role.Admin))]
    public async Task<IActionResult> DeleteAsync(Guid id)
    {
        var result = await _courseCategoryService.DeleteAsync(id);
        return ProcessResult(result);
    }
}
