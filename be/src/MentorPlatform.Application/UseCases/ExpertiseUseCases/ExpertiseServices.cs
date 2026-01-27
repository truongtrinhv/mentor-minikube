
using MentorPlatform.Application.Commons.Models.Responses.ExpertiseResponses;
using MentorPlatform.Application.Services.Caching;
using MentorPlatform.Application.UseCases.ExpertiseUseCases;
using MentorPlatform.Domain.Entities;
using MentorPlatform.Domain.Repositories;
using MentorPlatform.Domain.Shared;

namespace MentorPlatform.Application.UseCases.ExpertisesUseCases;

public class ExpertiseServices : IExpertiseServices
{
    private readonly IRepository<Expertise, Guid> _expertiseRepository;
    private readonly ICacheService _cache;

    public ExpertiseServices(
        IRepository<Expertise, Guid> expertiseRepository,
        ICacheService cache)
    {
        _expertiseRepository = expertiseRepository;
        _cache = cache;
    }

    public async Task<Result<List<ExpertiseResponse>>> GetAsync()
    {
        return await _cache.GetOrSetStaticAsync(
            CacheKeys.ExpertisesAll,
            async () =>
            {
                var query = _expertiseRepository.GetQueryable()
                    .Select(e => new ExpertiseResponse { Name = e.Name, Id = e.Id });
                return await _expertiseRepository.ToListAsync(query);
            }
        );
    }
}
