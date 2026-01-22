
using MentorPlatform.Domain.Entities;
using MentorPlatform.Domain.Enums;
using MentorPlatform.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace MentorPlatform.Persistence.Repositories;

public class UserRepository : Repository<User, Guid>, IUserRepository
{
    public UserRepository(ApplicationDbContext dbContext) : base(dbContext)
    {
    }

    public Task<User?> GetByEmailAsync(string email)
    {
        return _dbSet.Where(u => u.Email == email)
            .Include(u => u.UserDetail)
            .FirstOrDefaultAsync();
    }

    public Task<Dictionary<Role, int>> CountUsersByRoleAsync()
    {
        return _dbSet.Where(u => u.IsActive && u.IsVerifyEmail)
            .GroupBy(u => u.Role)
            .ToDictionaryAsync(g => g.Key, g => g.Count());
    }
}
