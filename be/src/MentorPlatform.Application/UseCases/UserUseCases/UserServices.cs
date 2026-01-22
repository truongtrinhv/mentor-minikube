using MentorPlatform.Application.Commons.Errors;
using MentorPlatform.Application.Commons.Mappings;
using MentorPlatform.Application.Commons.Models.Lookup;
using MentorPlatform.Application.Commons.Models.Query;
using MentorPlatform.Application.Commons.Models.Responses.AuthResponses;
using MentorPlatform.Application.Identity;
using MentorPlatform.Domain.Entities;
using MentorPlatform.Domain.Enums;
using MentorPlatform.Domain.Repositories;
using MentorPlatform.Domain.Shared;
using System.Data;

namespace MentorPlatform.Application.UseCases.UserManagement;

public class UserServices : IUserServices
{
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IExecutionContext _executionContext;

    public UserServices(IUserRepository userRepository, IUnitOfWork unitOfWork, IExecutionContext executionContext)
    {
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
        _executionContext = executionContext;
    }

    public async Task<Result> ChangeUserActiveAsync(Guid userId, bool isActive = true)
    {
        var adminId = _executionContext.GetUserId();

        if (adminId.Equals(userId))
        {
            return Result.Failure(UserErrors.CannotChangeOwnActiveStatus);
        }

        var dbUser = await _userRepository.GetByIdAsync(userId);
        if (dbUser == null)
        {
            return Result.Failure(UserErrors.UserNotExists);
        }

        dbUser.IsActive = isActive;
        await _unitOfWork.SaveChangesAsync();

        return Result.Success();
    }

    public async Task<Result<PaginationResult<UserResponse>>> GetUsersByQueryAsync(UserQueryParameters query)
    {
        var keyword = query.Search?.Trim().ToLower() ?? string.Empty;
        var roleList = query.Role.Select(x => (Role)x);
        var dbQuery = _userRepository
            .GetQueryable()
            .Where(u => (roleList.Contains(u.Role))
                    && (u.UserDetail.FullName.ToLower().Contains(keyword) || u.Email.ToLower().Contains(keyword))
                    && (u.Role != Role.Mentor || (u.ApplicationRequests != null && u.ApplicationRequests.Any(ar => ar.Status == ApplicationRequestStatus.Approved))));
        var dbUsers = await _userRepository
            .ToListAsync(dbQuery.OrderBy(u => u.Id)
                .Skip((query.PageNumber - 1) * query.PageSize)
                .Take(query.PageSize), [nameof(User.UserDetail)]);
        var userCount = await _userRepository.CountAsync(dbQuery);
        var pagination = new PaginationResult<UserResponse>(query.PageSize, query.PageNumber, userCount, dbUsers.Select(user => user.ToResponse()).ToList());
        return pagination;
    }

    public async Task<Result<PaginationResult<LookupModel>>> GetAllMentorsAsync(QueryParameters query)
    {
        var queryable = _userRepository.GetQueryable().Where(u =>
            u.Role == Role.Mentor &&
            u.IsActive &&
            u.IsVerifyEmail &&
            u.ApplicationRequests != null &&
            u.ApplicationRequests.Any(ar => ar.Status == ApplicationRequestStatus.Approved)
        );

        string? searchQuery = query.Search?.Trim().ToLower();
        if (!string.IsNullOrEmpty(searchQuery))
        {
            queryable = queryable.Where(u => u.UserDetail.FullName.ToLower().Contains(searchQuery) || u.Email.ToLower().Contains(searchQuery));
        }

        List<User> mentors = await _userRepository.ToListAsync(
            queryable.Skip((query.PageNumber - 1) * query.PageSize).Take(query.PageSize),
            [nameof(User.UserDetail)]
        );
        List<LookupModel> mentorResponses = mentors.Select(m => new LookupModel()
        {
            Id = m.Id,
            Name = m.UserDetail.FullName
        }).ToList();

        int totalMentorCount = await _userRepository.CountAsync(queryable);

        return new PaginationResult<LookupModel>(
            query.PageSize,
            query.PageNumber,
            totalMentorCount,
            mentorResponses
        );
    }
}
