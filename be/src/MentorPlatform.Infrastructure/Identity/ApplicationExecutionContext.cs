
using MentorPlatform.Application.Identity;
using MentorPlatform.Domain.Entities;

namespace MentorPlatform.Infrastructure.Identity;

public class ApplicationExecutionContext : IExecutionContext
{
    private User? _user;
    private Guid _identityTokenId;

    public Guid GetUserId()
    => _user?.Id ?? Guid.Empty;

    public User? GetUser()
        => _user;

    public Guid GetIdentityTokenId()
        => _identityTokenId;

    public void SetCurrentUser(User user)
    {
        _user = user;
    }

    public void SetIdentityTokenId(Guid identityTokenId)
    {
        _identityTokenId = identityTokenId;
    }
}
