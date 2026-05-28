using HomeDecorShop.Application;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace HomeDecorShop.API.Controllers;

[ApiController]
[AllowAnonymous]
[Route("api/auth")]
[SwaggerTag("Authentication and email confirmation endpoints.")]
[ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
public sealed class AuthController(IUserService userService) : ApiControllerBase
{
    [HttpPost("register")]
    [SwaggerOperation(
        Summary = "Register a new account",
        Description = "Creates a new user account and returns the initial authentication token for that user.")]
    [ProducesResponseType(typeof(AuthResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public ActionResult<AuthResult> Register([FromBody] RegisterUserInput input)
    {
        return Ok(userService.Register(input));
    }

    [HttpPost("login")]
    [SwaggerOperation(
        Summary = "Authenticate a user",
        Description = "Returns an authentication token when credentials are valid. Returns 401 for invalid credentials and 400 when the account has not completed email confirmation.")]
    [ProducesResponseType(typeof(AuthResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public ActionResult<AuthResult> Login([FromBody] LoginInput input)
    {
        var auth = userService.Login(input);
        return Ok(auth ?? throw new UnauthorizedException("Email or password is incorrect.", AppErrorCodes.InvalidCredentials));
    }

    [HttpGet("confirm-email")]
    [SwaggerOperation(
        Summary = "Confirm an email address",
        Description = "Validates the email confirmation token generated during registration.")]
    [ProducesResponseType(typeof(MessageResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    public ActionResult<MessageResponse> ConfirmEmail([FromQuery] string token)
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
