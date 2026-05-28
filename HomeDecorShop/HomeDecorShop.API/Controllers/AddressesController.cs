using HomeDecorShop.Application;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace HomeDecorShop.API.Controllers;

[ApiController]
[Authorize]
[Route("api/account/addresses")]
[SwaggerTag("CRUD operations for addresses of the currently authenticated user.")]
[ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
public sealed class AddressesController(IUserService userService) : ApiControllerBase
{
    [HttpGet]
    [SwaggerOperation(
        Summary = "List addresses of the current user",
        Description = "Returns all addresses owned by the authenticated user. Supports X-Auth-Token or Authorization: Bearer <token>.")]
    [ProducesResponseType(typeof(AddressView[]), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public ActionResult<IReadOnlyCollection<AddressView>> GetAll()
    {
        var token = ReadAuthenticatedToken();
        return Ok(userService.GetAddresses(token) ?? []);
    }

    [HttpGet("{id:int}")]
    [SwaggerOperation(
        Summary = "Get a specific address of the current user",
        Description = "Returns a single address owned by the authenticated user.")]
    [ProducesResponseType(typeof(AddressView), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public ActionResult<AddressView> GetById(int id)
    {
        var token = ReadAuthenticatedToken();
        var address = userService.GetAddressById(token, id);
        return Ok(RequireResource(address, $"Address with id {id} was not found."));
    }

    [HttpPost]
    [SwaggerOperation(
        Summary = "Create a new address for the current user",
        Description = "Creates a shipping address owned by the authenticated user.")]
    [ProducesResponseType(typeof(AddressView), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public ActionResult<AddressView> Create([FromBody] UpsertAddressInput input)
    {
        var address = userService.AddAddress(ReadAuthenticatedToken(), input)
            ?? throw new UnauthorizedException("Authentication token is invalid or has expired.", AppErrorCodes.AuthTokenInvalid);
        return CreatedAtAction(nameof(GetById), new { id = address.Id }, address);
    }

    [HttpPut("{id:int}")]
    [SwaggerOperation(
        Summary = "Update an address of the current user",
        Description = "Updates an existing address owned by the authenticated user.")]
    [ProducesResponseType(typeof(AddressView), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public ActionResult<AddressView> Update(int id, [FromBody] UpsertAddressInput input)
    {
        var token = ReadAuthenticatedToken();
        var address = userService.UpdateAddress(token, id, input);
        return Ok(RequireResource(address, $"Address with id {id} was not found."));
    }

    [HttpDelete("{id:int}")]
    [SwaggerOperation(
        Summary = "Delete an address of the current user",
        Description = "Removes an address owned by the authenticated user.")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public IActionResult Delete(int id)
    {
        var token = ReadAuthenticatedToken();
        EnsureResourceExists(userService.DeleteAddress(token, id), $"Address with id {id} was not found.");
        return NoContent();
    }

    private string ReadAuthenticatedToken()
    {
        var token = ReadRequiredToken();
        _ = userService.GetByToken(token) ?? throw new UnauthorizedException("Authentication token is invalid or has expired.", AppErrorCodes.AuthTokenInvalid);
        return token;
    }
}
