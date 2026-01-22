using MentorPlatform.Application.Commons.Models.Requests.CourseRequests;
using MentorPlatform.Domain.Shared;

namespace MentorPlatform.Application.UseCases.CourseUseCases;

public interface ICourseServices
{
    public Task<Result> GetLookupAsync(string? search);
    public Task<Result> GetAllAsync(CourseQueryParameters queryParameters);
    public Task<Result> GetAllForLearnerAsync(CourseQueryParameters queryParameters);
    public Task<Result> GetByIdAsync(Guid id);
    public Task<Result> AddCourseAsync(CreateCourseRequest courseRequest);
    public Task<Result> UpdateCourseAsync(Guid id, EditCourseRequest courseRequest);
    public Task<Result> DeleteCourseAsync(Guid courseId);
}
