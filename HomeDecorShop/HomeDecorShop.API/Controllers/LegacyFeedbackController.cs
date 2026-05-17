using HomeDecorShop.Application;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace HomeDecorShop.API.Controllers;

[ApiController]
[Route("api/Feedback")]
[Produces("application/json")]
[SwaggerTag("Legacy feedback endpoints kept for backward compatibility.")]
public sealed class LegacyFeedbackController(IFeedbackService feedbackService) : ControllerBase
{
    [HttpGet]
    [Authorize(Roles = ApiAuthenticationDefaults.AdminRole)]
    [SwaggerOperation(Summary = "Legacy list feedback endpoint")]
    public IActionResult GetAll()
    {
        return Ok(feedbackService.GetAll());
    }

    [HttpPost]
    [AllowAnonymous]
    [SwaggerOperation(Summary = "Legacy create feedback endpoint")]
    public IActionResult Create([FromBody] FeedbackUpsertInput input)
    {
        var created = feedbackService.Create(input);
        return Created($"/api/Feedback/{created.FeedbackId}", created);
    }
}
