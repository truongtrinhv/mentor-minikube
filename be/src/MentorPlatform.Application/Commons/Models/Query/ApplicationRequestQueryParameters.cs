
using MentorPlatform.Domain.Enums;

namespace MentorPlatform.Application.Commons.Models.Query;

public class ApplicationRequestQueryParameters : QueryParameters
{
    public List<int> ApplicationRequestStatuses { get; set; } = [(int)ApplicationRequestStatus.Pending, 
                    (int)ApplicationRequestStatus.Approved, (int)ApplicationRequestStatus.Rejected, (int) ApplicationRequestStatus.UnderReview];
}
