

using MentorPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MentorPlatform.Persistence.Configuration;

public class ResourceConfiguration : IEntityTypeConfiguration<Resource>
{
    public void Configure(EntityTypeBuilder<Resource> builder)
    {
        builder.HasOne(r => r.Mentor).WithMany(m => m.Resources)
            .HasForeignKey(r => r.MentorId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasQueryFilter(cc => !cc.IsDeleted);
    }
}
