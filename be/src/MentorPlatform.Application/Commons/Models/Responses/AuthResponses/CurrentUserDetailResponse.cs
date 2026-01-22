using MentorPlatform.Domain.Enums;

namespace MentorPlatform.Application.Commons.Models.Responses.AuthResponses;

public class CurrentUserDetailResponse : CurrentUserResponse
{
    public string? Bio { get; set; }
    public string? Experience { get; set; }
    public string? ProfessionalSkill { get; set; }
    public string? Goals { get; set; }
    public bool IsNotification { get; set; }
    public bool IsReceiveMessage { get; set; }
    public bool IsPrivateProfile { get; set; }
    public bool IsVerifyEmail { get; set; }
    public bool IsActive { get; set; }
    public CommunicationPreference CommunicationPreference { get; set; }
    public int Duration { get; set; }
    public SessionFrequency SessionFrequency { get; set; }
    public LearningStyle? LearningStyle { get; set; }
    public List<TeachingStyle>? TeachingStyles { get; set; }
    public List<UserAvailability>? Availability { get; set; }
    public List<ExpertiseResponse>? Expertises { get; set; }
    public List<CourseCategoryResponse>? CourseCategories { get; set; }
}

public class ExpertiseResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = default!;
}

public class CourseCategoryResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = default!;
    public string? Description { get; set; }
}
