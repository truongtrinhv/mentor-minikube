using MentorPlatform.Domain.Enums;

namespace MentorPlatform.Application.Commons.Models.Responses.ApplicationRequestResponses;

public class ApplicationRequestResponse
{
    public Guid Id { get; set; }
    public string Education { get; set; } = default!;
    public string WorkExperience { get; set; } = default!;
    public string FullName { get; set; } = default!;
    public string Description { get; set; } = default!;
    public ApplicationRequestStatus Status { get; set; }
    public DateTime Summitted { get; set; }
}

public class ApplicationRequestDetailResponse : ApplicationRequestResponse
{
    public string? Note { get; set; }
    public List<ApplicationRequestDocumentResponse>? ApplicationRequestDocuments { get; set; } = default;
    public string MentorEmail { get; set; } = default!;
    public List<string>? MentorExpertises { get; set; } = default!;
    public List<string>? MentorCertifications { get; set; } = default!;
    public string? AvatarUrl { get; set; } = default!;
}

public class ApplicationRequestDocumentResponse
{
    public string FilePath { get; set; } = default!;
    public string FileName { get; set; } = default!;
}