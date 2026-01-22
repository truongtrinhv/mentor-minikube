using MentorPlatform.Application.Commons.Models.Lookup;
using MentorPlatform.Application.Commons.Models.Query;
using MentorPlatform.Application.Commons.Models.Responses.AuthResponses;
using MentorPlatform.Domain.Shared;

namespace MentorPlatform.Application.UseCases.UserManagement;

public interface IUserServices
{
    public Task<Result> ChangeUserActiveAsync(Guid userId, bool isActive = true);
    public Task<Result<PaginationResult<UserResponse>>> GetUsersByQueryAsync(UserQueryParameters query);
    public Task<Result<PaginationResult<LookupModel>>> GetAllMentorsAsync(QueryParameters query);
}
