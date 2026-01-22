
using MentorPlatform.Application.Commons.Models.Responses.ExpertiseResponses;
using MentorPlatform.Application.UseCases.ExpertiseUseCases;
using MentorPlatform.Domain.Entities;
using MentorPlatform.Domain.Repositories;
using MentorPlatform.Domain.Shared;

namespace MentorPlatform.Application.UseCases.ExpertisesUseCases;

public class ExpertiseServices : IExpertiseServices
{
    private readonly IRepository<Expertise, Guid> _expertiseRepository;

    public ExpertiseServices(IRepository<Expertise, Guid> expertiseRepository)
    {
        _expertiseRepository = expertiseRepository;
    }
    public async Task<Result<List<ExpertiseResponse>>> GetAsync()
    {
        var query = _expertiseRepository.GetQueryable()
            .Select(e => new ExpertiseResponse { Name = e.Name, Id = e.Id });
        return await _expertiseRepository.ToListAsync(query);
    }
}
