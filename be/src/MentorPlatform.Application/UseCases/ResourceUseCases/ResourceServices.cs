using MentorPlatform.Application.Commons.CommandMessages;
using MentorPlatform.Application.Commons.Enums;
using MentorPlatform.Application.Commons.Errors;
using MentorPlatform.Application.Commons.Models.Requests.ResourceRequests;
using MentorPlatform.Application.Commons.Models.Requests.ResourseRequests;
using MentorPlatform.Application.Commons.Models.Responses.ResourceResponses;
using MentorPlatform.Application.Identity;
using MentorPlatform.Application.Services.Caching;
using MentorPlatform.Application.Services.File;
using MentorPlatform.Application.Services.FileStorage;
using MentorPlatform.CrossCuttingConcerns.Caching;
using MentorPlatform.CrossCuttingConcerns.Helpers;
using MentorPlatform.CrossCuttingConcerns.Options;
using MentorPlatform.Domain.Entities;
using MentorPlatform.Domain.Enums;
using MentorPlatform.Domain.Repositories;
using MentorPlatform.Domain.Shared;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace MentorPlatform.Application.UseCases.ResourceUseCases;

public class ResourceServices : IResourceServices
{
    private readonly IResourceRepository _resourceRepository;
    private readonly IRepository<MentoringSession, Guid> _mentorSessionRepository;
    private readonly IExecutionContext _executionContext;
    private readonly IUserRepository _userRepository;
    private readonly IFileStorageServices _fileStorageServices;
    private readonly FileStorageOptions _fileStorageOptions;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<ResourceServices> _logger;
    private readonly IMemoryCache _memoryCache;
    private readonly ICacheService _cacheService;

    public ResourceServices(IResourceRepository resourceRepository,
        IExecutionContext executionContext,
        IUserRepository userRepository,
        IRepository<MentoringSession, Guid> mentorSessionRepository,
        IFileStorageFactory fileStorageFactory,
        IUnitOfWork unitOfWork,
        ILogger<ResourceServices> logger,
        IOptions<FileStorageOptions> fileStorageOptions,
        IMemoryCache memoryCache,
        ICacheService cacheService)
    {
        _resourceRepository = resourceRepository;
        _executionContext = executionContext;
        _userRepository = userRepository;
        _mentorSessionRepository = mentorSessionRepository;
        _fileStorageServices = fileStorageFactory.Get();
        _unitOfWork = unitOfWork;
        _logger = logger;
        _fileStorageOptions = fileStorageOptions.Value;
        _memoryCache = memoryCache;
        _cacheService = cacheService;
    }

    public async Task<Result> CreateResource(CreateResourceRequest request)
    {
        var userId = _executionContext.GetUserId();

        try
        {
            var fileUrl = await _fileStorageServices.UploadFileAsync(request.File, UploadType.Private);

            string fileExtension = Path.GetExtension(request.File.FileName).ToLowerInvariant();
            string fileType = string.Empty;
            if (_fileStorageOptions.MediaSettings?.Images?.AllowedExtensions != null &&
                _fileStorageOptions.MediaSettings.Images.AllowedExtensions.Contains(fileExtension))
            {
                fileType = "Image";
            }
            else if (_fileStorageOptions.MediaSettings?.Videos?.AllowedExtensions != null &&
                     _fileStorageOptions.MediaSettings.Videos.AllowedExtensions.Contains(fileExtension))
            {
                fileType = "Video";
            }
            else if (_fileStorageOptions.MediaSettings?.Documents?.AllowedExtensions != null &&
                    _fileStorageOptions.MediaSettings.Documents.AllowedExtensions.Contains(fileExtension))
            {
                fileType = "Document";
            }

            var newResource = new Resource
            {
                MentorId = userId,
                FilePath = fileUrl,
                FileType = fileType,
                Title = request.Title.Trim(),
                Description = request.Description?.Trim().Replace("\r\n", "\n") ?? string.Empty,
            };

            _resourceRepository.Add(newResource);
            await _unitOfWork.SaveChangesAsync();

            // Invalidate caches
            await _cacheService.RemoveAsync(CacheKeys.Resource(newResource.Id));
            await _cacheService.RemoveByPrefixAsync(CacheKeys.ResourcesByMentor(userId));

            return Result<string>.Success(ResourceCommandMessages.CreateSuccessfully);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.Message);
            return Result<ResourceResponse>.Failure();
        }
    }

    public async Task<Result> EditResource(Guid id, EditResourceRequest request)
    {
        var userId = _executionContext.GetUserId();

        var selectedResource = await _resourceRepository.GetByIdAsync(id);
        if (selectedResource == null)
        {
            return Result.Failure(ResourceErrors.ResourceNotFound);
        }
        if (selectedResource.MentorId != userId)
        {
            return Result.Failure(ResourceErrors.ResourceNotBelongToUser);
        }

        selectedResource.Title = request.Title.Trim();
        selectedResource.Description = request.Description.Trim();

        _resourceRepository.Update(selectedResource);
        await _unitOfWork.SaveChangesAsync();

        // Invalidate caches
        await _cacheService.RemoveAsync(CacheKeys.Resource(id));
        await _cacheService.RemoveByPrefixAsync(CacheKeys.ResourcesByMentor(userId));

        return Result<string>.Success(ResourceCommandMessages.UpdateSuccessfully);
    }

    public async Task<Result> DeleteResource(Guid id)
    {
        var userId = _executionContext.GetUserId();

        var selectedResource = await _resourceRepository.GetByIdAsync(id);
        if (selectedResource == null)
        {
            return Result.Failure(ResourceErrors.ResourceNotFound);
        }
        if (selectedResource.MentorId != userId)
        {
            return Result.Failure(ResourceErrors.ResourceNotBelongToUser);
        }

        selectedResource.IsDeleted = true;

        _resourceRepository.Update(selectedResource);
        await _unitOfWork.SaveChangesAsync();
        // Invalidate caches
        await _cacheService.RemoveAsync(CacheKeys.Resource(id));
        await _cacheService.RemoveByPrefixAsync(CacheKeys.ResourcesByMentor(userId));
        return Result<string>.Success(ResourceCommandMessages.DeleteSuccessfully);
    }

    public async Task<Result> GetAllAsync(ResourceQueryParameters queryParameters)
    {
        var userId = _executionContext.GetUserId();
        var selectedUser = await _userRepository.GetByIdAsync(userId);

        if (selectedUser!.Role == Role.Admin)
        {
            return Result.Failure(403, ResourceErrors.AdminCanNotViewResource);
        }

        // Build cache key based on query parameters and user role
        var cacheKey = selectedUser.Role == Role.Mentor 
            ? CacheKeys.ResourcesByMentor(userId, queryParameters?.PageNumber ?? 1, queryParameters?.PageSize ?? 10, queryParameters?.Search, queryParameters?.FileType?.ToString())
            : CacheKeys.ResourcesByLearner(userId, queryParameters?.PageNumber ?? 1, queryParameters?.PageSize ?? 10, queryParameters?.Search, queryParameters?.FileType?.ToString());

        // Try to get from cache
        var result = await _cacheService.GetOrSetPaginatedAsync(
            cacheKey,
            async () =>
            {
                var learnerResourceIds = new List<Guid>();
                if (selectedUser.Role == Role.Learner)
                {
                    var learnerResourceQuery = _mentorSessionRepository.GetQueryable()
                        .Where(x => x.LearnerId == userId && (x.RequestStatus == RequestMentoringSessionStatus.Scheduled || x.RequestStatus == RequestMentoringSessionStatus.Completed))
                        .Select(x => x.Course).SelectMany(c => c.CourseResources).Where(cr => cr.Resource != null)
                        .Select(cr => cr.Resource.Id).Distinct();

                    learnerResourceIds = await _mentorSessionRepository.ToListAsync(learnerResourceQuery);
                }

                var searchValue = queryParameters?.Search?.Trim();
                var queryFilter = _resourceRepository.GetQueryable()
                                .Where(x => queryParameters == null ||
                                            (string.IsNullOrEmpty(searchValue) || x.Title.Contains(searchValue))
                                            && (queryParameters!.FileType == null || x.FileType == queryParameters.FileType)
                                            && ((selectedUser.Role == Role.Learner && learnerResourceIds.Contains(x.Id)) || x.MentorId == selectedUser.Id));

                var queryPagination = queryFilter
                                    .Skip((queryParameters!.PageNumber - 1) * queryParameters.PageSize)
                                    .Take(queryParameters.PageSize)
                                    .Select(x => new ResourceResponse()
                                    {
                                        Id = x.Id,
                                        Title = x.Title,
                                        FileType = x.FileType,
                                        FilePath = x.FilePath,
                                        CourseCount = x.CourseResources.Count,
                                        MentorName = x.Mentor.UserDetail.FullName,
                                        Description = x.Description
                                    });
                var res = PaginationResult<ResourceResponse>.Create(data: await _resourceRepository.ToListAsync(queryPagination),
                                                                          totalCount: await _resourceRepository.CountAsync(queryFilter),
                                                                          pageNumber: queryParameters.PageNumber,
                                                                          pageSize: queryParameters.PageSize);
                return res;
            });

        return Result<PaginationResult<ResourceResponse>>.Success(result);
    }

    public async Task<Result> GetByIdAsync(Guid id)
    {
        var userId = _executionContext.GetUserId();
        var selectedUser = await _userRepository.GetByIdAsync(userId);
        if (selectedUser!.Role == Role.Admin)
        {
            return Result.Failure(403, ResourceErrors.AdminCanNotViewResource);
        }

        // Try to get from cache
        var cacheKey = CacheKeys.Resource(id);
        var cachedResource = await _cacheService.GetAsync<ResourceDetailsResponse>(cacheKey);
        
        if (cachedResource != null && (selectedUser.Role == Role.Mentor && cachedResource.MentorId == userId || selectedUser.Role == Role.Learner))
        {
            // Additional permission check for learner from cache
            if (selectedUser.Role == Role.Learner)
            {
                var learnerCoursesCacheKey = CacheKeys.LearnerResources(userId);
                var learnerResourceIds = await _cacheService.GetAsync<List<Guid>>(learnerCoursesCacheKey);
                
                if (learnerResourceIds != null && learnerResourceIds.Contains(id))
                {
                    return Result<ResourceDetailsResponse>.Success(cachedResource);
                }
            }
            else
            {
                return Result<ResourceDetailsResponse>.Success(cachedResource);
            }
        }

        var query = _resourceRepository.GetQueryable()
            .Where(x => x.Id == id)
            .Select(x => new ResourceDetailsResponse()
            {
                Id = x.Id,
                Title = x.Title,
                FileType = x.FileType,
                FilePath = x.FilePath,
                MentorId = x.MentorId,
                Description = x.Description,
            });

        var selectedResource = await _resourceRepository.FirstOrDefaultAsync(query);
        if (selectedResource == null)
        {
            return Result.Failure(404, ResourceErrors.ResourceNotExists);
        }

        if (selectedUser!.Role == Role.Mentor && selectedResource.MentorId != userId)
        {
            return Result.Failure(403, ResourceErrors.MentorCanNotViewResource);
        }

        if (selectedUser.Role == Role.Learner)
        {
            var learnerResources = _mentorSessionRepository.GetQueryable()
                .Where(x => x.LearnerId == userId && x.RequestStatus == RequestMentoringSessionStatus.Scheduled || x.RequestStatus == RequestMentoringSessionStatus.Completed)
                .Select(x => x.Course).SelectMany(c => c.CourseResources).Where(cr => cr.Resource != null)
                .Select(cr => cr.Resource.Id).Distinct();

            var learnerCourses = await _mentorSessionRepository.ToListAsync(learnerResources);

            if (!learnerCourses.Any(x => x == id))
            {
                return Result.Failure(403, ResourceErrors.LearnerCanNotViewResource);
            }
            
            // Cache learner resources for quick permission checks
            await _cacheService.SetAsync(
                CacheKeys.LearnerResources(userId),
                learnerCourses,
                CacheConfiguration.PermissionData.AbsoluteExpiration,
                CacheConfiguration.PermissionData.SlidingExpiration);
        }

        // Cache the resource
        await _cacheService.SetAsync(
            cacheKey,
            selectedResource,
            CacheConfiguration.EntityData.AbsoluteExpiration,
            CacheConfiguration.EntityData.SlidingExpiration);

        return Result<ResourceDetailsResponse>.Success(selectedResource);
    }

    public async Task<Result> GetPreSignedUrlFile(Guid id)
    {
        var selectedResourceResult = await GetByIdAsync(id);
        if (!selectedResourceResult.IsSuccess)
        {
            return selectedResourceResult;
        }
        var cacheKey = StringHelper.ReplacePlaceholders(CacheKeyConstants.ResourceUrl, id.ToString());
        var preSignedUrl = _memoryCache.Get(cacheKey)?.ToString() ?? string.Empty;
        if (preSignedUrl == "")
        {
            var resultData = selectedResourceResult as Result<ResourceDetailsResponse>;
            preSignedUrl = await _fileStorageServices.GetPreSignedUrlFile(resultData!.Data!.FilePath);
            _memoryCache.Set(cacheKey, preSignedUrl, TimeSpan.FromMinutes(1));
        }
        return Result<string>.Success(preSignedUrl);
    }

}




