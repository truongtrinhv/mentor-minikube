using MentorPlatform.Domain.Enums;

namespace MentorPlatform.Application.Commons.Models.Responses.AuthResponses;

public class CurrentUserResponse
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = default!;
    public string? AvatarUrl { get; set; } = default;
    public string Email { get; set; }
    public Role Role { get; set; }
}
