
using MentorPlatform.Application.Identity;
using MentorPlatform.Domain.Primitives;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace MentorPlatform.Persistence.Interceptors;

public class AuditableEntityInterceptor(IExecutionContext executionContext) : SaveChangesInterceptor
{
    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData,
        InterceptionResult<int> result,
        CancellationToken cancellationToken = default)
    {
        DbContext? dbContext = eventData.Context;

        if (dbContext is null)
        {
            return base.SavingChangesAsync(
                eventData,
                result,
                cancellationToken);
        }

        IEnumerable<EntityEntry<AuditableEntity>> entries =
            dbContext
                .ChangeTracker
                .Entries<AuditableEntity>();

        foreach (EntityEntry<AuditableEntity> entityEntry in entries)
        {
            if (entityEntry.State == EntityState.Added)
            {
                entityEntry.Property(a => a.CreatedBy).CurrentValue = executionContext.GetUserId();
                entityEntry.Property(a => a.CreatedAt).CurrentValue = DateTime.UtcNow;
            }

            if (entityEntry.State == EntityState.Modified)
            {
                entityEntry.Property(a => a.ModifiedBy).CurrentValue = executionContext.GetUserId();
                entityEntry.Property(a => a.ModifiedAt).CurrentValue = DateTime.UtcNow;
            }
        }

        return base.SavingChangesAsync(
            eventData,
            result,
            cancellationToken);
    }
}
