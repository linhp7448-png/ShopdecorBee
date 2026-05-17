using HomeDecorShop.Application;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace HomeDecorShop.API.Controllers;

[ApiController]
[Authorize]
[Route("api/account")]
[SwaggerTag("Operations for the currently authenticated user.")]
[ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
public sealed class AccountController(IUserService userService) : ApiControllerBase
{
    [HttpGet("profile")]
    [SwaggerOperation(
        Summary = "Get the current user profile",
        Description = "Returns profile information for the authenticated user. Supports X-Auth-Token or Authorization: Bearer <token>.")]
    [ProducesResponseType(typeof(UserView), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public ActionResult<UserView> GetProfile()
    {
        return Ok(GetCurrentUser());
    }

    [HttpPut("profile")]
    [SwaggerOperation(
        Summary = "Update the current user profile",
        Description = "Updates the full name and phone number of the authenticated user.")]
    [ProducesResponseType(typeof(UserView), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public ActionResult<UserView> UpdateProfile([FromBody] UpdateProfileInput input)
    {
        var user = userService.UpdateProfile(ReadAuthenticatedToken(), input);
        return Ok(user ?? throw new UnauthorizedException("Authentication token is invalid or has expired.", AppErrorCodes.AuthTokenInvalid));
    }

    private UserView GetCurrentUser()
    {
        var user = userService.GetByToken(ReadRequiredToken());
        return user ?? throw new UnauthorizedException("Authentication token is invalid or has expired.", AppErrorCodes.AuthTokenInvalid);
    }

    private string ReadAuthenticatedToken()
    {
        var token = ReadRequiredToken();
        _ = userService.GetByToken(token) ?? throw new UnauthorizedException("Authentication token is invalid or has expired.", AppErrorCodes.AuthTokenInvalid);
        return token;
    }
}
