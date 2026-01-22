using Microsoft.AspNetCore.Mvc;

namespace MentorPlatform.WebApi.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class HealthController : ControllerBase
    {
        [HttpGet]
        public IActionResult Get()
        {
            return Ok(new
            {
                status = "Healthy",
                timestamp = DateTime.UtcNow,
                service = "MentorPlatform API"
            });
        }
    }
}
