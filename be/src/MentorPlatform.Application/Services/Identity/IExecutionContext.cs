
using MentorPlatform.Domain.Entities;

namespace MentorPlatform.Application.Identity;

public interface IExecutionContext
{
    Guid GetUserId();
    User? GetUser();
    Guid GetIdentityTokenId();

    void SetCurrentUser(User user);
    void SetIdentityTokenId(Guid identityTokenId);
}
