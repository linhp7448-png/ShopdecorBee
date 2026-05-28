using HomeDecorShop.Application;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace HomeDecorShop.API.Controllers;

[ApiController]
[Authorize]
[Route("api/cart")]
[SwaggerTag("Cart operations for the currently authenticated user.")]
[ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
public sealed class CartController(ICartService cartService) : ApiControllerBase
{
    [HttpGet]
    [SwaggerOperation(
        Summary = "Get the current cart",
        Description = "Returns the shopping cart of the authenticated user. Creates an empty cart on first access.")]
    [ProducesResponseType(typeof(CartView), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public ActionResult<CartView> GetCurrent()
    {
        return Ok(cartService.GetCurrent(ReadRequiredToken()));
    }

    [HttpPost("items")]
    [SwaggerOperation(
        Summary = "Add an item to the cart",
        Description = "Adds a product to the cart or increases its quantity when the product already exists in the cart.")]
    [ProducesResponseType(typeof(CartView), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public ActionResult<CartView> AddItem([FromBody] AddCartItemInput input)
    {
        return Ok(cartService.AddItem(ReadRequiredToken(), input));
    }

    [HttpPut("items/{itemId:int}")]
    [SwaggerOperation(
        Summary = "Update cart item quantity",
        Description = "Changes the quantity of an existing cart item.")]
    [ProducesResponseType(typeof(CartView), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public ActionResult<CartView> UpdateItem(int itemId, [FromBody] UpdateCartItemQuantityInput input)
    {
        return Ok(cartService.UpdateItem(ReadRequiredToken(), itemId, input));
    }

    [HttpDelete("items/{itemId:int}")]
    [SwaggerOperation(
        Summary = "Remove an item from the cart",
        Description = "Deletes a single cart item of the authenticated user.")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public IActionResult RemoveItem(int itemId)
    {
        EnsureResourceExists(cartService.RemoveItem(ReadRequiredToken(), itemId), $"Cart item with id {itemId} was not found.");
        return NoContent();
    }

    [HttpDelete("items")]
    [SwaggerOperation(
        Summary = "Clear the cart",
        Description = "Removes all items from the current cart.")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public IActionResult Clear()
    {
        _ = cartService.Clear(ReadRequiredToken());
        return NoContent();
    }
}
