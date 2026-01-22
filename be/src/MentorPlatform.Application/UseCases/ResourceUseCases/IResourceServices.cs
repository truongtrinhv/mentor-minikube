using MentorPlatform.Application.Commons.Models.Requests.ResourceRequests;
using MentorPlatform.Application.Commons.Models.Requests.ResourseRequests;
using MentorPlatform.Domain.Shared;

namespace MentorPlatform.Application.UseCases.ResourceUseCases;
public interface IResourceServices
{
    public Task<Result> CreateResource(CreateResourceRequest request);
    public Task<Result> EditResource(Guid id, EditResourceRequest request);
    public Task<Result> DeleteResource(Guid id);
    public Task<Result> GetAllAsync(ResourceQueryParameters queryParameters);
    public Task<Result> GetByIdAsync(Guid id);
    public Task<Result> GetPreSignedUrlFile(Guid id);
}
