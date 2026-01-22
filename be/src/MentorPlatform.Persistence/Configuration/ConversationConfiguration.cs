using MentorPlatform.Domain.Constants;
using MentorPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MentorPlatform.Persistence.Configuration;
public class ConversationConfiguration : IEntityTypeConfiguration<Conversation>
{
    public void Configure(EntityTypeBuilder<Conversation> builder)
    {
        builder.HasQueryFilter(c => !c.IsDeleted);

        builder.Property(c => c.ConversationName)
            .IsRequired()
            .HasMaxLength(MessageConstants.ConversationMaxLength);
        builder.Property(c => c.IsGroup)
            .IsRequired();
    }
}
