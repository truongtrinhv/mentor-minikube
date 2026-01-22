using MentorPlatform.Domain.Enums;

namespace MentorPlatform.Application.Commons.Models.Responses.ConversationResponses;
public class UserResponse
{
    public Guid Id { get; set; }
    public string FullName { get; set; }
    public string? AvatarUrl { get; set; }
    public Role Role { get; set; }
}
