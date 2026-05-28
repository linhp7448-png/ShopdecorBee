using HomeDecorShop.Application;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace HomeDecorShop.API.Controllers;

public sealed record RequestRefundInput(string Reason);

[ApiController]
[Authorize]
[Route("api/orders")]
[SwaggerTag("Order placement and management for the currently authenticated user.")]
[ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
public sealed class OrdersController(IOrderService orderService) : ApiControllerBase
{
    [HttpGet]
    [SwaggerOperation(
        Summary = "List current user orders",
        Description = "Returns all orders of the authenticated user ordered by newest first.")]
    [ProducesResponseType(typeof(OrderView[]), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public ActionResult<IReadOnlyCollection<OrderView>> GetMine()
    {
        return Ok(orderService.GetMine(ReadRequiredToken()));
    }

    [HttpGet("{id:int}")]
    [SwaggerOperation(
        Summary = "Get an order by id",
        Description = "Returns a single order owned by the authenticated user.")]
    [ProducesResponseType(typeof(OrderView), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public ActionResult<OrderView> GetById(int id)
    {
        return Ok(RequireResource(orderService.GetById(ReadRequiredToken(), id), $"Order with id {id} was not found."));
    }

    [HttpPost]
    [SwaggerOperation(
        Summary = "Place an order from the current cart",
        Description = "Creates an order from the current cart, snapshots item prices, deducts stock and clears the cart.")]
    [ProducesResponseType(typeof(OrderView), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public ActionResult<OrderView> Create([FromBody] PlaceOrderInput input)
    {
        var created = orderService.PlaceOrder(ReadRequiredToken(), input);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPost("{id:int}/cancel")]
    [SwaggerOperation(
        Summary = "Cancel an order",
        Description = "Cancels an unpaid order and restores stock to the catalog.")]
    [ProducesResponseType(typeof(OrderView), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public ActionResult<OrderView> Cancel(int id)
    {
        return Ok(RequireResource(orderService.Cancel(ReadRequiredToken(), id), $"Order with id {id} was not found."));
    }

    [HttpPost("{id:int}/request-refund")]
    [SwaggerOperation(
        Summary = "Request a refund for an order",
        Description = "Requests a refund (Khiếu nại) for a paid order.")]
    [ProducesResponseType(typeof(OrderView), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public ActionResult<OrderView> RequestRefund(int id, [FromBody] RequestRefundInput input)
    {
        return Ok(RequireResource(orderService.RequestRefund(ReadRequiredToken(), id, input.Reason), $"Order with id {id} was not found."));
    }
}
