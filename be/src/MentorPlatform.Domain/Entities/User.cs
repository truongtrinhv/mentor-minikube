
using MentorPlatform.Domain.Enums;
using MentorPlatform.Domain.Primitives;
using System.Text.Json.Serialization;

namespace MentorPlatform.Domain.Entities;

public class User : AuditableEntity, IHasKey<Guid>, ISoftDeleteEntity
{
    public Guid Id { get; set; }
    public bool IsDeleted { get; set; } = false;
    public string Email { get; set; } = default!;
    public string Password { get; set; } = default!;
    public Role Role { get; set; }
    public bool IsNotification { get; set; } = true;
    public bool IsReceiveMessage { get; set; } = true;
    public bool IsPrivateProfile { get; set; } = false;
    public bool IsVerifyEmail { get; set; } = false;
    public bool IsActive { get; set; } = true;
    public DateTime LastActive { get; set; } = default!;
    [JsonIgnore]
    public UserDetail UserDetail { get; set; } = default!;
    public virtual ICollection<UserExpertise>? UserExpertises { get; set; }
    public virtual ICollection<MentoringSession>? MentoringSessions { get; set; }
    public virtual ICollection<Schedule>? Schedules { get; set; }
    public virtual ICollection<Course>? Courses { get; set; }
    public virtual ICollection<ApplicationRequest>? ApplicationRequests { get; set; }
    public virtual ICollection<UserCourseCategory>? UserCourseCategories { get; set; }
    public virtual ICollection<Resource>? Resources { get; set; }
    public virtual ICollection<Notification>? Notifications { get; set; }
    public virtual ICollection<Participant> Participants { get; set; }
    public virtual ICollection<Message> Messages { get; set; }
}
