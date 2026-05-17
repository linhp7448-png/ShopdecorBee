using Microsoft.AspNetCore.Mvc;
using HomeDecorShop.Application;
using Swashbuckle.AspNetCore.Annotations;

namespace HomeDecorShop.API.Controllers;

[ApiController]
[Route("api/admin/orders")]
[SwaggerTag("Admin order management endpoints.")]
public sealed class AdminOrdersController(IOrderService orderService) : ApiControllerBase
{
    [HttpGet]
    [SwaggerOperation(
        Summary = "List all orders",
        Description = "Returns all orders in the system for admin review. Ordered by newest first.")]
    [ProducesResponseType(typeof(OrderView[]), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public ActionResult<IReadOnlyCollection<OrderView>> GetAll()
    {
        return Ok(orderService.GetAll(ReadRequiredToken()));
    }

    [HttpPatch("{id:int}/status")]
    [SwaggerOperation(
        Summary = "Update order status",
        Description = "Updates the status of an order. Accepts snake_case status strings (e.g., 'processing', 'shipped').")]
    [ProducesResponseType(typeof(OrderView), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public ActionResult<OrderView> UpdateStatus(int id, [FromQuery] string status)
    {
        var result = orderService.UpdateStatus(ReadRequiredToken(), id, status);
        return Ok(RequireResource(result, $"Order with id {id} was not found."));
    }

    [HttpPost("{id:int}/process-refund")]
    [SwaggerOperation(
        Summary = "Approve or reject a refund",
        Description = "Allows admin to approve or reject a refund request (khiếu nại).")]
    [ProducesResponseType(typeof(OrderView), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public ActionResult<OrderView> ProcessRefund(int id, [FromQuery] bool approve)
    {
        var result = orderService.ProcessRefund(ReadRequiredToken(), id, approve);
        return Ok(RequireResource(result, $"Order with id {id} was not found or not in refund requested status."));
    }
}
