
namespace MentorPlatform.Domain.Repositories;

public interface IUnitOfWork
{
    Task BeginTransactionAsync();
    Task RollbackAsync();
    Task CommitTransactionAsync();
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
