using MentorPlatform.Application.Commons.Models.Requests.ApplicationMentorRequests;
using MentorPlatform.Domain.Entities;

namespace MentorPlatform.Application.Commons.Mappings;

public static class ApplicationRequestMappings
{
    public static ApplicationRequest ToApplicationRequest(
        this CreateApplicationRequestMentorRequest createApplicationRequestMentorRequest)
    {
        return new ()
        {
            Education = createApplicationRequestMentorRequest.Education,
            WorkExperience = createApplicationRequestMentorRequest.WorkExperience,
            Description = createApplicationRequestMentorRequest.Description,
            Certifications = createApplicationRequestMentorRequest.Certifications,
            Status = createApplicationRequestMentorRequest.Status,
            Submitted = DateTime.UtcNow
        };
    }
}
