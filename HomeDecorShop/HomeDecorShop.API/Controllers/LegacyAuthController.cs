using HomeDecorShop.Application;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace HomeDecorShop.API.Controllers;

[ApiController]
[AllowAnonymous]
[Route("api/users")]
[Produces("application/json")]
[SwaggerTag("Legacy authentication endpoints kept for backward compatibility.")]
public sealed class LegacyAuthController(IUserService userService) : ControllerBase
{
    [HttpPost("register")]
    [SwaggerOperation(Summary = "Legacy register endpoint")]
    public IActionResult Register([FromBody] RegisterUserInput input)
    {
        return Ok(userService.Register(input));
    }

    [HttpPost("login")]
    [SwaggerOperation(Summary = "Legacy login endpoint")]
    public IActionResult Login([FromBody] LoginInput input)
    {
        var auth = userService.Login(input);
        return Ok(auth ?? throw new UnauthorizedException("Email or password is incorrect.", AppErrorCodes.InvalidCredentials));
    }

    [HttpGet("confirm-email")]
    [SwaggerOperation(Summary = "Legacy email confirmation endpoint")]
    public IActionResult ConfirmEmail([FromQuery] string token)
    {
        if (!userService.ConfirmEmail(token))
        {
            throw new RequestValidationException(
                "Email confirmation token is invalid or has expired.",
                new Dictionary<string, string[]>
                {
                    ["token"] = ["Email confirmation token is invalid or has expired."]
                },
                AppErrorCodes.EmailConfirmationTokenInvalid);
        }

        return Ok(new MessageResponse("Xac nhan email thanh cong."));
    }
}
