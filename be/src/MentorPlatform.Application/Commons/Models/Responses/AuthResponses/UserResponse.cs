using MentorPlatform.Domain.Enums;

namespace MentorPlatform.Application.Commons.Models.Responses.AuthResponses;
public class UserResponse
{
    public Guid Id { get; set; }
    public bool IsDeleted { get; set; }
    public string Email { get; set; }
    public Role Role { get; set; }
    public bool IsNotification { get; set; }
    public bool IsReceiveMessage { get; set; }
    public bool IsPrivateProfile { get; set; }
    public bool IsVerifyEmail { get; set; }
    public UserStatus Status { get; set; }
    public DateTime LastActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public UserDetailResponse UserDetail { get; set; }
}

public enum UserStatus
{
    Active = 0,
    Inactive = 1,
    PendingForApproval = 2
}
