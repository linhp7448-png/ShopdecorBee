using HomeDecorShop.Application;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace HomeDecorShop.API.Controllers;

[ApiController]
[Authorize]
[Route("api/users")]
[Produces("application/json")]
[SwaggerTag("Legacy account endpoints kept for backward compatibility.")]
public sealed class LegacyAccountController(IUserService userService) : ControllerBase
{
    [HttpGet("me")]
    [SwaggerOperation(Summary = "Legacy current-user endpoint")]
    public IActionResult GetCurrentUser()
    {
        var user = userService.GetByToken(ReadToken());
        return Ok(user ?? throw new UnauthorizedException("Authentication token is invalid or has expired.", AppErrorCodes.AuthTokenInvalid));
    }

    [HttpPut("me")]
    [SwaggerOperation(Summary = "Legacy update current-user endpoint")]
    public IActionResult UpdateCurrentUser([FromBody] UpdateProfileInput input)
    {
        var token = ReadToken();
        _ = userService.GetByToken(token) ?? throw new UnauthorizedException("Authentication token is invalid or has expired.", AppErrorCodes.AuthTokenInvalid);
        var user = userService.UpdateProfile(token, input);
        return Ok(user ?? throw new UnauthorizedException("Authentication token is invalid or has expired.", AppErrorCodes.AuthTokenInvalid));
    }

    [HttpPost("me/addresses")]
    [SwaggerOperation(Summary = "Legacy add current-user address endpoint")]
    public IActionResult AddCurrentUserAddress([FromBody] UpsertAddressInput input)
    {
        var token = ReadToken();
        _ = userService.GetByToken(token) ?? throw new UnauthorizedException("Authentication token is invalid or has expired.", AppErrorCodes.AuthTokenInvalid);
        _ = userService.AddAddress(token, input) ?? throw new UnauthorizedException("Authentication token is invalid or has expired.", AppErrorCodes.AuthTokenInvalid);
        var user = userService.GetByToken(token);
        return Ok(user ?? throw new UnauthorizedException("Authentication token is invalid or has expired.", AppErrorCodes.AuthTokenInvalid));
    }

    private string ReadToken() => AuthTokenReader.ReadToken(HttpContext);
}
