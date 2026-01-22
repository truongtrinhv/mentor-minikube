using MentorPlatform.Domain.Enums;

namespace MentorPlatform.Application.Commons.Models.Query;
public class UserQueryParameters : QueryParameters
{
    public List<int> Role { get; set; } = [0,1,2];
}