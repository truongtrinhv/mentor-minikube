
using MentorPlatform.Application.Commons;
using MentorPlatform.CrossCuttingConcerns.Exceptions;
using MentorPlatform.Domain.Shared;
using MentorPlatform.Presentation.Attributes;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace MentorPlatform.Presentation.Controllers;

[ValidationRequestModel]
[ApiController]
public abstract class ApiControllerBase : ControllerBase
{
    protected readonly Dispatcher Dispatcher;
    protected ApiControllerBase(Dispatcher dispatcher) => Dispatcher = dispatcher;
    protected IActionResult OnResultSuccess<T>(T result)
        where T : Result
        => result.StatusCode switch
        {
            StatusCodes.Status200OK => Ok(result),
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
