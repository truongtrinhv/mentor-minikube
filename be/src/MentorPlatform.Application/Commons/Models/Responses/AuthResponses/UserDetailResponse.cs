namespace MentorPlatform.Application.Commons.Models.Responses.AuthResponses;
public class UserDetailResponse
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }

    public string FullName { get; set; } = default!;
    public string? Bio { get; set; } = default;
    public string? AvatarUrl { get; set; } = default;
    public string? Experience { get; set; } = default;
    public int CommunicationPreference { get; set; }
    public string? ProfessionalSkill { get; set; } = default;
    public string? Goals { get; set; }
    public int Duration { get; set; }
    public int SessionFrequency { get; set; }
    public int? LearningStyle { get; set; } = default!;
    public List<int>? TeachingStyles { get; set; } = default!;
}
