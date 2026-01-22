using MentorPlatform.Application.Commons.Models.Query;
using MentorPlatform.Application.Commons.Models.Requests.ApplicationMentorRequests;
using MentorPlatform.Application.Commons.Models.Responses.ApplicationRequestResponses;
using MentorPlatform.Domain.Shared;

namespace MentorPlatform.Application.UseCases.ApplicationRequestUseCases;

public interface IApplicationRequestServices
{
    Task<Result> CreateAsync(CreateApplicationRequestMentorRequest createApplicationRequestMentorRequest);
    Task<Result> UpdateAsync(UpdateApplicationRequestMentorRequest updateApplicationRequestMentorRequest);
    Task<Result> RequestUpdateAsync(RequestUpdateApplicationDocumentRequest requestUpdateApplicationDocumentRequest);
    Task<Result> ApproveAsync(Guid id);
    Task<Result> RejectAsync(Guid id, string note);
    Task<Result<ApplicationRequestDetailResponse>> GetCurrentUserApplicationAsync();

    Task<Result<PaginationResult<ApplicationRequestResponse>>> GetAsync(
        ApplicationRequestQueryParameters applicationRequestQueryParameters);

    Task<Result<ApplicationRequestDetailResponse>> GetDetailAsync(Guid id);
}
