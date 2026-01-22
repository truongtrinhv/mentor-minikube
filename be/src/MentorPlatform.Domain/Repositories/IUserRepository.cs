
using MentorPlatform.Domain.Entities;
using MentorPlatform.Domain.Enums;

namespace MentorPlatform.Domain.Repositories;

public interface IUserRepository : IRepository<User, Guid>
{
    Task<User?> GetByEmailAsync(string email);
    Task<Dictionary<Role, int>> CountUsersByRoleAsync();
}
