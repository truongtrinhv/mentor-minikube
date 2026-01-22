using MentorPlatform.Application.Commons.Errors;
using MentorPlatform.Application.Identity;
using MentorPlatform.CrossCuttingConcerns.Caching;
using MentorPlatform.CrossCuttingConcerns.Exceptions;
using MentorPlatform.CrossCuttingConcerns.Helpers;
using MentorPlatform.Domain.Entities;
using MentorPlatform.Domain.Repositories;
using MentorPlatform.Persistence;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.IdentityModel.JsonWebTokens;
using System.Net;
using System.Security.Claims;

namespace MentorPlatform.WebApi.Middlewares;

public class ExecutionContextMiddleware
{
    private readonly RequestDelegate _next;

    public ExecutionContextMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, IUserRepository userRepository, ApplicationDbContext applicationDbContext,
        IExecutionContext executionContext, IMemoryCache memoryCache)
    {
        if (context.User.Identity?.IsAuthenticated == true)
        {
            Guid.TryParse(context.User.FindFirstValue(JwtRegisteredClaimNames.Sid), out Guid id);
            Guid.TryParse(context.User.FindFirstValue(JwtRegisteredClaimNames.Jti), out Guid jti);

            User? user = await userRepository.GetByIdAsync(id);
            if (user == null)
            {
                throw new BadRequestException(UserErrorMessages.UserNotExists);
            }
            string recallAccessTokenCacheKey = StringHelper.ReplacePlaceholders(CacheKeyConstants.RecallTokenKey,
                user.Id.ToString(), jti.ToString());
            if (memoryCache.Get(recallAccessTokenCacheKey) is not null)
            {
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                await context.Response.WriteAsync(nameof(HttpStatusCode.Unauthorized));
                return;
            }
            if (!user.IsActive)
            {
                throw new BadRequestException(UserErrorMessages.UserHasBeenDeactivated);
            }
            if (!user.IsVerifyEmail)
            {
                throw new UnauthorizedException(UserErrorMessages.UserHasNotBeenVerified);
            }

            user.LastActive = DateTime.UtcNow;
            applicationDbContext.Users.Update(user);
            await applicationDbContext.SaveChangesAsync();
            executionContext.SetCurrentUser(user);
            executionContext.SetIdentityTokenId(jti);

        }

        await _next(context);
    }
}