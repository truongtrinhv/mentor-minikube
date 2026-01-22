using MentorPlatform.Domain.Constants;
using MentorPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MentorPlatform.Persistence.Configuration;
public class AttachmentConfiguration : IEntityTypeConfiguration<Attachment>
{
    public void Configure(EntityTypeBuilder<Attachment> builder)
    {
        builder.HasQueryFilter(a => !a.IsDeleted);
        builder.Property(a => a.Type)
            .IsRequired()
            .HasMaxLength(MessageConstants.TypeMaxLength);
        builder.Property(a => a.Url)
            .IsRequired()
            .HasMaxLength(MessageConstants.UrlMaxLength);
        builder.Property(a => a.Size)
            .IsRequired();
        builder.HasOne(a => a.Message)
            .WithMany(m => m.Attachments)
            .HasForeignKey(a => a.MessageId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
