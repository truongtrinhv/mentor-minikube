
using MentorPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MentorPlatform.Persistence.Configuration;

public class CourseResourceConfiguration : IEntityTypeConfiguration<CourseResource>
{
    public void Configure(EntityTypeBuilder<CourseResource> builder)
    {
        builder.HasOne(cr => cr.Course).WithMany(c => c.CourseResources).HasForeignKey(cr => cr.CourseId);
        builder.HasOne(cr => cr.Resource).WithMany(r => r.CourseResources).HasForeignKey(cr => cr.ResourceId);
        builder.HasQueryFilter(cc => !cc.IsDeleted);
    }
}
