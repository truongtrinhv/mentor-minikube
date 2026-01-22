using MentorPlatform.Application.Identity;
using MentorPlatform.Domain.Entities;
using MentorPlatform.Domain.Enums;
using MentorPlatform.Domain.Repositories;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace MentorPlatform.API.Attributes
{
    public class MentorApprovedFilterAttribute(IExecutionContext executionContext,
        IUserRepository userRepository) : Attribute, IAsyncAuthorizationFilter
{
    public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
    {
        if (context.HttpContext.User.IsInRole(nameof(Role.Mentor)))
        {
            var userId = executionContext.GetUserId();
            var user = await userRepository.GetByIdAsync(userId, nameof(User.ApplicationRequests));
 
            if (!user?.ApplicationRequests?.Any(ar => ar.Status == ApplicationRequestStatus.Approved) ?? false)
            {
                context.Result = new StatusCodeResult(StatusCodes.Status403Forbidden);
            }
        }
    }
}
}