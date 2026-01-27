using MentorPlatform.Application.Commons.CommandMessages;
using MentorPlatform.Application.Commons.Errors;
using MentorPlatform.Application.Commons.Models.Lookup;
using MentorPlatform.Application.Commons.Models.Query;
using MentorPlatform.Application.Commons.Models.Requests.CourseCategoryRequests;
using MentorPlatform.Application.Commons.Models.Responses.CourseCategory;
using MentorPlatform.Application.Services.Caching;
using MentorPlatform.Domain.Repositories;
using MentorPlatform.Domain.Shared;

namespace MentorPlatform.Application.UseCases.CourseCategoryUseCases;
public class CourseCategoryServices : ICourseCategoryServices
{
    private readonly ICourseCategoryRepository _courseCategoryRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICacheService _cache;

    public CourseCategoryServices(
        ICourseCategoryRepository courseCategoryRepository, 
        IUnitOfWork unitOfWork,
        ICacheService cache)
    {
        _courseCategoryRepository = courseCategoryRepository;
        _unitOfWork = unitOfWork;
        _cache = cache;
    }


    public async Task<Result> GetLookupAsync()
    {
        return await _cache.GetOrSetLookupAsync(
            CacheKeys.CourseCategoriesLookup,
            async () =>
            {
                var query = _courseCategoryRepository.GetQueryable()
                                .Where(x => x.IsActive)
                                .Select(x => new LookupModel()
                                {
                                    Id = x.Id,
                                    Name = x.Name
                                });
                var res = await _courseCategoryRepository.ToListAsync(query);
                return Result<List<LookupModel>>.Success(res);
            }
        );
    }

    public async Task<Result> GetAllAsync(QueryParameters queryParameters)
    {
        var cacheKey = CacheKeys.CourseCategoryPage(
            queryParameters.PageNumber, 
            queryParameters.PageSize, 
            queryParameters.Search);

        return await _cache.GetOrSetPaginatedAsync(
            cacheKey,
            async () =>
            {
                var searchValue = queryParameters?.Search?.Trim();
                var queryAll = _courseCategoryRepository.GetQueryable()
                                .Where(x => string.IsNullOrEmpty(searchValue)
                                            || x.Name.Contains(searchValue)
                                            || x.Description.Contains(searchValue));
                var queryPagination = queryAll
                                    .Skip((queryParameters.PageNumber - 1) * queryParameters.PageSize)
                                    .Take(queryParameters.PageSize)
                                    .Select(x => new CourseCategoryResponse()
                                    {
                                        Id = x.Id,
                                        Name = x.Name,
                                        Description = x.Description,
                                        CourseCount = x.Courses != null ? x.Courses.Count : 0,
                                        IsActive = x.IsActive
                                    });
                var res = PaginationResult<CourseCategoryResponse>.Create(
                    data: await _courseCategoryRepository.ToListAsync(queryPagination),
                    totalCount: await _courseCategoryRepository.CountAsync(queryAll),
                    pageNumber: queryParameters.PageNumber,
                    pageSize: queryParameters.PageSize);

                return Result<PaginationResult<CourseCategoryResponse>>.Success(res);
            }
        );
    }

    public async Task<Result> GetByIdAsync(Guid id)
    {
        return await _cache.GetOrSetEntityAsync(
            CacheKeys.CourseCategory(id),
            async () =>
            {
                var query = _courseCategoryRepository.GetQueryable()
                                                        .Where(x => x.Id == id)
                                                        .Select(x => new CourseCategoryDetailResponse()
                                                        {
                                                            Id = x.Id,
                                                            Name = x.Name,
                                                            Description = x.Description,
                                                            CourseCount = x.Courses != null ? x.Courses.Count : 0,
                                                            IsActive = x.IsActive,
                                                            Courses = x.Courses != null ? x.Courses.Select(c => new CourseInforForCategoryResponse()
                                                            {
                                                                Id = c.Id,
                                                                Title = c.Title,
                                                                Description = c.Description,
                                                                Level = c.Level
                                                            }).ToList() : new List<CourseInforForCategoryResponse>()
                                                        });

                var selectedCategory = await _courseCategoryRepository.FirstOrDefaultAsync(query);
                if (selectedCategory == null)
                {
                    return Result.Failure(404, CourseCategoryErrors.CourseCategoryNotExists);
                }
                return Result<CourseCategoryDetailResponse>.Success(selectedCategory);
            }
        );
    }

    public async Task<Result> CreateAsync(CreateCourseCategoryRequest createRequest)
    {
        var query = _courseCategoryRepository.GetQueryable().Where(x => x.Name.ToLower() == createRequest.Name.Trim().ToLower());
        if (await _courseCategoryRepository.AnyAsync(query))
        {
            return Result.Failure(400, CourseCategoryErrors.CourseCategoryDuplicateName);
        }
        var newEntity = new Domain.Entities.CourseCategory
        {
            Name = createRequest.Name,
            Description = createRequest.Description,
            IsActive = true,
        };
        _courseCategoryRepository.Add(newEntity);

        await _unitOfWork.SaveChangesAsync();

        // Invalidate all category caches
        await _cache.RemoveAsync(CacheKeys.CourseCategoriesLookup);
        await _cache.RemoveAsync(CacheKeys.CourseCategoriesAll);

        return Result<string>.Success(CourseCategoryCommandMessages.CreatedSuccessfully, 201);
    }

    public async Task<Result> UpdateAsync(Guid id, UpdateCourseCategoryRequest updateRequest)
    {
        var selectedCategory = await _courseCategoryRepository.GetByIdAsync(id, nameof(Domain.Entities.CourseCategory.UserCourseCategories), nameof(Domain.Entities.CourseCategory.Courses));
        if (selectedCategory == null)
        {
            return Result.Failure(404, CourseCategoryErrors.CourseCategoryNotExists);
        }

        var queryExistedName = _courseCategoryRepository.GetQueryable()
                                .Where(x => x.Id != selectedCategory.Id && x.Name.ToLower() == updateRequest.Name.Trim().ToLower());
        if (await _courseCategoryRepository.AnyAsync(queryExistedName))
        {
            return Result.Failure(400, CourseCategoryErrors.CourseCategoryDuplicateName);
        }

        if (!updateRequest.IsActive)
        {
            if ((selectedCategory.Courses != null && selectedCategory.Courses.Count != 0)
                || (selectedCategory.UserCourseCategories != null && selectedCategory.UserCourseCategories.Count != 0))
            {
                return Result.Failure(400, CourseCategoryErrors.CourseCategoryCannotChangeStatus);
            }
        }

        selectedCategory.Name = updateRequest.Name;
        selectedCategory.Description = updateRequest.Description;
        selectedCategory.IsActive = updateRequest.IsActive;
        _courseCategoryRepository.Update(selectedCategory);
        await _unitOfWork.SaveChangesAsync();

        // Invalidate caches
        await _cache.RemoveAsync(CacheKeys.CourseCategory(id));
        await _cache.RemoveAsync(CacheKeys.CourseCategoriesLookup);
        await _cache.RemoveAsync(CacheKeys.CourseCategoriesAll);

        return Result<string>.Success(CourseCategoryCommandMessages.UpdatedSuccessfully, 204);

    }

    public async Task<Result> DeleteAsync(Guid id)
    {
        var selectedCategory = await _courseCategoryRepository.GetByIdAsync(id, nameof(Domain.Entities.CourseCategory.UserCourseCategories), nameof(Domain.Entities.CourseCategory.Courses));
        if (selectedCategory == null)
        {
            return Result.Failure(404, CourseCategoryErrors.CourseCategoryNotExists);
        }
        if ((selectedCategory.Courses != null && selectedCategory.Courses.Count != 0)
            || (selectedCategory.UserCourseCategories != null && selectedCategory.UserCourseCategories.Count != 0))
        {
            return Result.Failure(400, CourseCategoryErrors.CourseCategoryIsUsed);
        }

        _courseCategoryRepository.Remove(selectedCategory);
        await _unitOfWork.SaveChangesAsync();

        // Invalidate caches
        await _cache.RemoveAsync(CacheKeys.CourseCategory(id));
        await _cache.RemoveAsync(CacheKeys.CourseCategoriesLookup);
        await _cache.RemoveAsync(CacheKeys.CourseCategoriesAll);

        return Result<string>.Success(CourseCategoryCommandMessages.DeletedSuccessfully, 204);
    }

}
