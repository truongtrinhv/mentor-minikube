namespace MentorPlatform.Application.Commons.Models.Responses.ResourceResponses;

public class ResourceResponse
{
    public Guid Id { get; set; }
    public string MentorName { get; set; }
    public string FileType { get; set; } = default!;
    public string FilePath { get; set; } = default!;

    public int CourseCount { get; set; }
    public string Title { get; set; } = default!;
    public string Description { get; set; } = default!;
}

public class ResourceDetailsResponse
{
    public Guid Id { get; set; }
    public Guid MentorId { get; set; }
    public string FileType { get; set; } = default!;
    public string FilePath { get; set; } = default!;
    public string Title { get; set; } = default!;
    public string Description { get; set; } = default!;
}
