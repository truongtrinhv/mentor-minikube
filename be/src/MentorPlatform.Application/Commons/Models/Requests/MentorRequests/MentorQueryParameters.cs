using MentorPlatform.Application.Commons.Models.Query;

namespace MentorPlatform.Application.Commons.Models.Requests.MentorRequests;
 
public class MentorQueryParameters : QueryParameters
{
    public new string Search { get; set; } = string.Empty;
    public Guid? CategoryId { get; set; }
} 