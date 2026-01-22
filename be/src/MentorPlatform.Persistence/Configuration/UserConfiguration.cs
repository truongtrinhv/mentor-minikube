
using MentorPlatform.Domain.Constants;
using MentorPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MentorPlatform.Persistence.Configuration;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.HasOne(ud => ud.UserDetail)
            .WithOne(u => u.User)
            .HasForeignKey<UserDetail>(u => u.UserId);
        builder.HasQueryFilter(u => !u.IsDeleted);
        builder.Property(u => u.Email)
            .HasMaxLength(UserConstants.MaxLengthGmail);
        builder.Property(u => u.Password)
            .HasMaxLength(UserConstants.MaxLengthPasswordHash);
    }
}
