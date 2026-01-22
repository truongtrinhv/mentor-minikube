using MentorPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MentorPlatform.Persistence.Configuration;
public class NotificationConfiguration : IEntityTypeConfiguration<Notification>
{
    public void Configure(EntityTypeBuilder<Notification> builder)
    {
        builder.HasQueryFilter(n => !n.IsDeleted);
        builder.HasOne(n => n.Owner)
            .WithMany(u => u.Notifications)
            .HasForeignKey(u => u.OwnerId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
