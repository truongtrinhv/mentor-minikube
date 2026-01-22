
using MentorPlatform.Domain.Constants;
using MentorPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MentorPlatform.Persistence.Configuration;

public class UserDetailConfiguration : IEntityTypeConfiguration<UserDetail>
{
    public void Configure(EntityTypeBuilder<UserDetail> builder)
    {
        builder.Property(ud => ud.FullName)
            .HasMaxLength(UserConstants.MaxLengthFullName);

        builder.Property(ud => ud.Bio)
            .HasMaxLength(UserConstants.MaxLengthBio);

        builder.Property(ud => ud.AvatarUrl)
            .HasMaxLength(UserConstants.MaxLengthAvatarUrl);

        builder.Property(ud => ud.ProfessionalSkill)
            .HasMaxLength(UserConstants.MaxLengthProfessionalSkills);

        builder.Property(ud => ud.Experience)
            .HasMaxLength(UserConstants.MaxLengthIndustryExperience);

        builder.Property(ud => ud.Goals)
            .HasMaxLength(UserConstants.MaxLengthGoals);

        builder.Property(ud => ud.LearningStyle)
            .HasMaxLength(UserConstants.MaxLengthLearningStyle);
        builder.HasQueryFilter(cc => !cc.IsDeleted);
    }
}
