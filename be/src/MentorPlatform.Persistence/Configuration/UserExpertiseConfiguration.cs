
using MentorPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MentorPlatform.Persistence.Configuration;

public class UserExpertiseConfiguration : IEntityTypeConfiguration<UserExpertise>
{
    public void Configure(EntityTypeBuilder<UserExpertise> builder)
    {
        builder.HasKey(ue => new { ue.UserId, ue.ExpertiseId });

        builder.HasOne(ue => ue.User)
            .WithMany(u => u.UserExpertises)
            .HasForeignKey(ue => ue.UserId);

        builder.HasOne(ue => ue.Expertise)
            .WithMany(e => e.UserExpertises)
            .HasForeignKey(ue => ue.ExpertiseId);
        builder.HasQueryFilter(cc => !cc.IsDeleted);
    }
}
