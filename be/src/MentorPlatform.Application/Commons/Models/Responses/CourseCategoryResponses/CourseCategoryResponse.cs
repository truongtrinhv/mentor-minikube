using MentorPlatform.Domain.Enums;

namespace MentorPlatform.Application.Commons.Models.Responses.CourseCategory;

public class CourseInforForCategoryResponse
{
    public Guid Id { get; set; }
    public string Title { get; set; } = default!;
    public string Description { get; set; } = default!;
    public CourseLevel Level { get; set; } = default!;
}

public class CourseCategoryResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = default!;
    public string Description { get; set; } = default!;
    public int CourseCount { get; set; } = default!;
    public bool IsActive { get; set; } = true;
}

public class CourseCategoryDetailResponse : CourseCategoryResponse
{
    public List<CourseInforForCategoryResponse> Courses { get; set; }
}
