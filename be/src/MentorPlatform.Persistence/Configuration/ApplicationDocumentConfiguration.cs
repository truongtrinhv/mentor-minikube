
using MentorPlatform.Domain.Constants;
using MentorPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MentorPlatform.Persistence.Configuration;

public class ApplicationDocumentConfiguration : IEntityTypeConfiguration<ApplicationDocument>
{
    public void Configure(EntityTypeBuilder<ApplicationDocument> builder)
    {
        builder.HasOne(ad => ad.ApplicationRequest)
            .WithMany(aq => aq.ApplicationDocuments)
            .HasForeignKey(ad => ad.ApplicationRequestId);
        builder.HasQueryFilter(cc => !cc.IsDeleted);
        builder.Property(c => c.FileName)
            .HasMaxLength(ApplicationRequestConstants.MaxLengthFileName);
        builder.Property(c => c.FilePath)
            .HasMaxLength(ApplicationRequestConstants.MaxLengthFilePath);
    }
}
