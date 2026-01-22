using MentorPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MentorPlatform.Persistence.Configuration;

public class MentoringSessionConfiguration : IEntityTypeConfiguration<MentoringSession>
{
    public void Configure(EntityTypeBuilder<MentoringSession> builder)
    {

        builder.HasOne(u => u.Learner)
            .WithMany(u => u.MentoringSessions)
            .HasForeignKey(u => u.LearnerId);

        builder.HasOne(u => u.Course)
            .WithMany(u => u.MentoringSessions)
            .HasForeignKey(u => u.CourseId);


        builder.HasOne(u => u.Schedule)
             .WithMany(s => s.MentoringSessions)
             .HasForeignKey(u => u.ScheduleId)
             .OnDelete(DeleteBehavior.NoAction);

        builder.HasOne(u => u.OldSchedule)
            .WithMany(s => s.OldMentoringSessions)
            .HasForeignKey(u => u.OldScheduleId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasIndex(m => m.ScheduleId)
                .IsUnique()
                .HasFilter($"[{nameof(MentoringSession.RequestStatus)}] = 0");

        builder.HasQueryFilter(cc => !cc.IsDeleted);

    }
}