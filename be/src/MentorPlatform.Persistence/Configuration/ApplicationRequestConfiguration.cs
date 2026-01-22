
using MentorPlatform.Domain.Constants;
using MentorPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MentorPlatform.Persistence.Configuration;

public class ApplicationRequestConfiguration : IEntityTypeConfiguration<ApplicationRequest>
{
    public void Configure(EntityTypeBuilder<ApplicationRequest> builder)
    {
        builder.HasOne(ar => ar.Mentor)
            .WithMany(u => u.ApplicationRequests)
            .HasForeignKey(ar => ar.MentorId)
            .OnDelete(DeleteBehavior.NoAction);
        builder.HasQueryFilter(cc => !cc.IsDeleted);

        builder.Property(b => b.Description)
            .HasMaxLength(ApplicationRequestConstants.MaxLengthDescription);

        builder.Property(b => b.Education)
            .HasMaxLength(ApplicationRequestConstants.MaxLengthEducation);
        builder.Property(b => b.Certifications)
            .HasConversion(
                v => v == null
                    ? null
                    : string.Join(";-;", v),
                v => string.IsNullOrEmpty(v)
                    ? new List<string>()
                    : v.Split(new[] { ";-;" }, StringSplitOptions.None)
                        .ToList()
            );
        builder.Property(b => b.WorkExperience)
            .HasMaxLength(ApplicationRequestConstants.MaxLengthWorkExperience);

        builder.Property(b => b.Note)
            .HasMaxLength(ApplicationRequestConstants.MaxLengthNote);
    }
}
