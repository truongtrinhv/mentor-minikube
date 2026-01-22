
using MentorPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MentorPlatform.Persistence.Configuration;

public class CourseConfiguration : IEntityTypeConfiguration<Course>
{
    public void Configure(EntityTypeBuilder<Course> builder)
    {
        builder.HasOne(c => c.CourseCategory)
            .WithMany(cc => cc.Courses)
            .HasForeignKey(c => c.CourseCategoryId);
        builder.HasQueryFilter(cc => !cc.IsDeleted);

        builder.HasOne(c => c.Mentor)
            .WithMany(u => u.Courses)
            .HasForeignKey(c => c.MentorId)
            .OnDelete(DeleteBehavior.NoAction);
    }
}
