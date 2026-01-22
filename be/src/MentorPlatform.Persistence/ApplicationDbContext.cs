
using MentorPlatform.CrossCuttingConcerns.Exceptions;
using MentorPlatform.Domain.Entities;
using MentorPlatform.Domain.Primitives;
using MentorPlatform.Domain.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using System.Data;
using System.Reflection;

namespace MentorPlatform.Persistence;

public class ApplicationDbContext : DbContext, IUnitOfWork
{
    private const string CanNotRollBackEmptyTransaction = "Cannot roll back empty transaction!";
    private const string CurrentTransactionNull = "Current transaction null";
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public ApplicationDbContext() { }
    private IDbContextTransaction? _transaction;

    public DbSet<User> Users { get; set; } = default!;
    public DbSet<CourseCategory> CourseCategories { get; set; } = default!;
    public DbSet<Course> Courses { get; set; } = default!;
    public DbSet<UserCourseCategory> UserCourseCategories { get; set; } = default!;
    public DbSet<UserDetail> UserDetails { get; set; } = default!;
    public DbSet<UserExpertise> UserExpertises { get; set; } = default!;
    public DbSet<Expertise> Expertises { get; set; } = default!;
    public DbSet<RefreshToken> RefreshTokens { get; set; } = default!;
    public DbSet<CourseResource> CourseResources { get; set; } = default!;
    public DbSet<Resource> Resources { get; set; } = default!;
    public DbSet<MentoringSession> MentoringSessions { get; set; } = default!;
    public DbSet<Schedule> Schedules { get; set; } = default!;
    public DbSet<ApplicationDocument> ApplicationDocuments { get; set; } = default!;
    public DbSet<ApplicationRequest> ApplicationRequests { get; set; } = default!;
    public DbSet<Notification> Notifications { get; set; } = default!;
    public DbSet<Conversation> Conversations { get; set; } = default!;
    public DbSet<Message> Messages { get; set; } = default!;
    public DbSet<Participant> Participants { get; set; } = default!;
    public DbSet<Attachment> Attachments { get; set; } = default!;

    private bool HasActiveTransaction => _transaction != null;


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (typeof(IConcurrencyEntity).IsAssignableFrom(entityType.ClrType))
            {
                modelBuilder.Entity(entityType.ClrType)
                    .Property(nameof(IConcurrencyEntity.RowVersion))
                    .IsRowVersion()
                    .IsConcurrencyToken();
            }
        }

        base.OnModelCreating(modelBuilder);

    }
    public async Task BeginTransactionAsync()
    {
        _transaction = await Database.BeginTransactionAsync(IsolationLevel.ReadCommitted);
    }

    public async Task RollbackAsync()
    {
        if (_transaction == null)
        {
            throw new ArgumentException(CanNotRollBackEmptyTransaction);
        }
        try
        {
            await _transaction!.RollbackAsync();
        }
        finally
        {
            if (HasActiveTransaction)
            {
                _transaction!.Dispose();
                _transaction = null;
            }
        }
    }

    public async Task CommitTransactionAsync()
    {
        if (_transaction == null)
        {
            throw new ArgumentException(CurrentTransactionNull);
        }
        try
        {
            await _transaction.CommitAsync();
        }
        catch
        {
            await RollbackAsync();
            throw;
        }
        finally
        {
            if (HasActiveTransaction)
            {
                _transaction.Dispose();
                _transaction = null;
            }
        }
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            return await base.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            throw new ConcurrencyConflictException(ApplicationExceptionMessage.ConcurrencyConflictError);
        }
        catch (Microsoft.EntityFrameworkCore.DbUpdateException)
        {
            throw new CrossCuttingConcerns.Exceptions.DbUpdateException(ApplicationExceptionMessage.DbUpdateError);
        }

    }

}