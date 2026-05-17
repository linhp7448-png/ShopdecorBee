using HomeDecorShop.Application;
using HomeDecorShop.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace HomeDecorShop.API.Controllers;

[ApiController]
[Authorize(Roles = ApiAuthenticationDefaults.AdminRole)]
[Route("api/users")]
[SwaggerTag("Administrative operations for users.")]
[ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
public sealed class UsersController(IUserService userService) : ApiControllerBase
{
    [HttpGet]
    [SwaggerOperation(
        Summary = "List users",
        Description = "Returns all users currently stored by the backend.")]
    [ProducesResponseType(typeof(UserView[]), StatusCodes.Status200OK)]
    public ActionResult<IReadOnlyCollection<UserView>> GetAll()
    {
        return Ok(userService.GetAll());
    }

    [HttpGet("{id:int}")]
    [SwaggerOperation(
        Summary = "Get a user by id",
        Description = "Returns a single user by numeric identifier.")]
    [ProducesResponseType(typeof(UserView), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public ActionResult<UserView> GetById(int id)
    {
        return Ok(RequireResource(userService.GetById(id), $"User with id {id} was not found."));
    }

    [HttpPut("{id:int}/role")]
    [SwaggerOperation(
        Summary = "Update a user role",
        Description = "Changes the role of a user to either admin or customer.")]
    [ProducesResponseType(typeof(MessageResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public ActionResult<MessageResponse> UpdateUserRole(int id, [FromBody] UpdateUserRoleInput input)
    {
        var role = input.Role.Trim().Equals("admin", StringComparison.OrdinalIgnoreCase)
            ? UserRole.Admin
            : UserRole.Customer;

        EnsureResourceExists(userService.UpdateRole(id, role), $"User with id {id} was not found.");
        return Ok(new MessageResponse("Cap nhat quyen thanh cong."));
    }

    [HttpPatch("{id:int}/status")]
    [SwaggerOperation(
        Summary = "Toggle user status",
        Description = "Toggles the IsActive flag of a user.")]
    [ProducesResponseType(typeof(MessageResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public ActionResult<MessageResponse> ToggleStatus(int id)
    {
        EnsureResourceExists(userService.ToggleStatus(id), $"User with id {id} was not found.");
        return Ok(new MessageResponse("Cap nhat trang thai thanh cong."));
    }

    [HttpDelete("{id:int}")]
    [SwaggerOperation(
        Summary = "Delete a user",
        Description = "Deletes a user by numeric identifier.")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public IActionResult Delete(int id)
    {
        EnsureResourceExists(userService.Delete(id), $"User with id {id} was not found.");
        return NoContent();
    }
}
