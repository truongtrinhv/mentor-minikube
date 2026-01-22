using MentorPlatform.Application.UseCases.ExpertiseUseCases;
using Microsoft.AspNetCore.Mvc;

namespace MentorPlatform.WebApi.Controllers;

[Route("api/[controller]")]
public class ExpertisesController : ApiControllerBase
{
    private readonly IExpertiseServices _expertiseUseCases;

    public ExpertisesController(IExpertiseServices expertiseUseCases)
    {
        _expertiseUseCases = expertiseUseCases;
    }
    [HttpGet]
    public async Task<IActionResult> GetAsync()
    {
        var result = await _expertiseUseCases.GetAsync();

        return ProcessResult(result);
    }
}
