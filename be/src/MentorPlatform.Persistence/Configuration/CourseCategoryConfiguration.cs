
using MentorPlatform.Domain.Constants;
using MentorPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MentorPlatform.Persistence.Configuration;

public class CourseCategoryConfiguration : IEntityTypeConfiguration<CourseCategory>
{
    public void Configure(EntityTypeBuilder<CourseCategory> builder)
    {
        builder.HasQueryFilter(cc => !cc.IsDeleted);

        builder.Property(cc => cc.Description)
                .HasMaxLength(CourseCategoryConstants.DescriptionMaxLength);

        builder.Property(cc => cc.Name)
                .IsRequired()
                .HasMaxLength(CourseCategoryConstants.NameMaxLength);
        builder.HasIndex(cc => cc.Name).IsUnique();
    }
}
