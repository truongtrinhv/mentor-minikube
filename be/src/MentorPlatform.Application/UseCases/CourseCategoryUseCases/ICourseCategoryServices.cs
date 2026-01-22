using MentorPlatform.Application.Commons.Models.Query;
using MentorPlatform.Application.Commons.Models.Requests.CourseCategoryRequests;
using MentorPlatform.Domain.Shared;

namespace MentorPlatform.Application.UseCases.CourseCategoryUseCases;
public interface ICourseCategoryServices
{
    public Task<Result> GetLookupAsync();
    public Task<Result> GetAllAsync(QueryParameters queryParameters);
    public Task<Result> GetByIdAsync(Guid id);
    public Task<Result> CreateAsync(CreateCourseCategoryRequest createRequest);
    public Task<Result> UpdateAsync(Guid id, UpdateCourseCategoryRequest updateRequest);
    public Task<Result> DeleteAsync(Guid id);

}
