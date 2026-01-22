using FluentValidation;
using MentorPlatform.CrossCuttingConcerns.Exceptions;
using MentorPlatform.Domain.Shared;
using Microsoft.AspNetCore.Diagnostics;
using System.Net;

namespace MentorPlatform.WebApi.Middlewares;

public class GlobalHandlingExceptionMiddleware :  IExceptionHandler
{
    private readonly ILogger<GlobalHandlingExceptionMiddleware> _logger;

    public GlobalHandlingExceptionMiddleware(ILogger<GlobalHandlingExceptionMiddleware> logger)
    {
        _logger = logger;
    }

    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        _logger.LogError(exception, exception.Message);
        var statusCode = GetExceptionResponseStatusCode(exception);
        httpContext.Response.StatusCode = statusCode;
        httpContext.Response.ContentType = "application/json";
        var message = GetExceptionResponseMessage(exception) ?? string.Empty;
        var errorResponse = new Result(statusCode, false, new Error(message, exception.Message));
        await httpContext.Response.WriteAsJsonAsync(errorResponse, cancellationToken);
        return true;
    }

    private static int GetExceptionResponseStatusCode(Exception exception)
    {
        return exception switch
        {
            BadRequestException => (int)HttpStatusCode.BadRequest,
            NotFoundException => (int)HttpStatusCode.NotFound,
            ValidationException => (int)HttpStatusCode.BadRequest,
            UnauthorizedException => (int)HttpStatusCode.Unauthorized,
            ConcurrencyConflictException => (int) HttpStatusCode.Conflict,
            _ => (int)HttpStatusCode.InternalServerError
        };
    }

    private static string GetExceptionResponseMessage(Exception exception)
    {
        return exception switch
        {
            BadRequestException => nameof(HttpStatusCode.BadRequest),
            NotFoundException => nameof(HttpStatusCode.NotFound),
            ValidationException => nameof(HttpStatusCode.UnprocessableEntity),
            UnauthorizedException => nameof(HttpStatusCode.Unauthorized),
            ConcurrencyConflictException => ApplicationExceptionMessage.ConcurrencyConflictError,
            _ => nameof(HttpStatusCode.InternalServerError),
        };
    }
}