using MentorPlatform.CrossCuttingConcerns.Exceptions;
using MentorPlatform.Domain.Shared;
using MentorPlatform.WebApi.Attributes;
using Microsoft.AspNetCore.Mvc;

namespace MentorPlatform.WebApi.Controllers;

[ServiceFilter(typeof(ValidationRequestModelAttribute))]
[ApiController]
public abstract class ApiControllerBase : ControllerBase
{
    protected IActionResult OnResultSuccess<T>(T result)
        where T : Result
        => result.StatusCode switch
        {
            StatusCodes.Status200OK => Ok(result),
            StatusCodes.Status204NoContent => NoContent(),
            _ => StatusCode(result.StatusCode, result)
        };

    protected IActionResult OnResultFailure<T>(T result)
        where T : Result
        => result.StatusCode switch
        {
            StatusCodes.Status400BadRequest => BadRequest(result),
            StatusCodes.Status404NotFound => NotFound(result),
            _ => StatusCode(result.StatusCode, result)
        };

    protected IActionResult ProcessResult<T>(T result)
        where T : Result
    {
        if (result == null)
        {
            throw new BadRequestException("Response api must be not null");
        }
        return result.IsSuccess ? OnResultSuccess(result) : OnResultFailure(result);
    }

}
