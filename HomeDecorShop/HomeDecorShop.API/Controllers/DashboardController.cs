using Microsoft.AspNetCore.Mvc;
using HomeDecorShop.API;
using HomeDecorShop.Application;
using Swashbuckle.AspNetCore.Annotations;

namespace HomeDecorShop.API.Controllers;

[ApiController]
[Route("api/admin/dashboard")]
[SwaggerTag("Admin dashboard statistics and information.")]
public sealed class DashboardController(IDashboardService dashboardService) : ApiControllerBase
{
    [HttpGet("stats")]
    [SwaggerOperation(
        Summary = "Get dashboard statistics",
        Description = "Returns summary statistics for the admin dashboard including revenue, orders, and chart data.")]
    [ProducesResponseType(typeof(DashboardStatsView), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public ActionResult<DashboardStatsView> GetStats()
    {
        return Ok(dashboardService.GetStats(ReadRequiredToken()));
    }
}
