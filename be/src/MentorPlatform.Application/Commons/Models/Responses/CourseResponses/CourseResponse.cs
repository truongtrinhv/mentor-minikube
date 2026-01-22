using MentorPlatform.Application.Commons.Models.Lookup;
using MentorPlatform.Domain.Enums;

namespace MentorPlatform.Application.Commons.Models.Responses.CourseResponses;

public class CourseResponse
{
    public Guid Id { get; set; }
    public string Title { get; set; } = default!;
    public int LearnerCount { get; set; } = default!;
    public string Description { get; set; } = default!;
    public string CategoryName { get; set; } = default!;
    public CourseLevel Level { get; set; } = default!;
}

public class CourseDetailsResponse
{
    public Guid Id { get; set; }
    public string Title { get; set; } = default!;
    public int LearnerCount { get; set; } = default!;
    public string Description { get; set; } = default!;
    public bool HasAccessResourcePermission { get; set; }
    public CourseDetailsCategoryResponse Category { get; set; } = default!;
    public CourseLevel Level { get; set; } = default!;
    public MentorInfoForCourseResponse Mentor { get; set; } = default!;
    public List<ResourceResponse> Resources { get; set; } = default!;
}

public class CourseDetailsCategoryResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = default!;
}

public class MentorInfoForCourseResponse
{
    public Guid Id { get; set; } = default!;
    public string FullName { get; set; } = default!;
    public string? AvatarUrl { get; set; } = default;
    public string? Experience { get; set; } = default;
    public string? Email { get; set; } = default;
    public List<LookupModel>? Expertises { get; set; }
}

public class ResourceResponse
{
    public Guid Id { get; set; } = default!;
    public string Title { get; set; } = default!;
    public string Description { get; set; } = default!;
    public string FilePath { get; set; } = default!;
    public string FileType { get; set; } = default!;
}