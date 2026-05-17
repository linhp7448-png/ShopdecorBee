using System.Security.Claims;
using System.Text.Encodings.Web;
using HomeDecorShop.Application;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace HomeDecorShop.API;

internal sealed class TokenAuthenticationHandler(
    IOptionsMonitor<AuthenticationSchemeOptions> options,
    ILoggerFactory logger,
    UrlEncoder encoder,
    IUserRepository userRepository)
    : AuthenticationHandler<AuthenticationSchemeOptions>(options, logger, encoder)
{
    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var token = AuthTokenReader.ReadToken(Context);
        if (string.IsNullOrWhiteSpace(token))
        {
            return Task.FromResult(AuthenticateResult.NoResult());
        }

        var user = userRepository.GetByToken(token.Trim());
        if (user is null)
        {
            return Task.FromResult(AuthenticateResult.Fail("Authentication token is invalid or has expired."));
        }

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
            new Claim(ClaimTypes.Name, user.FullName),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role.ToString())
        };

        var identity = new ClaimsIdentity(claims, Scheme.Name, ClaimTypes.Name, ClaimTypes.Role);
        var principal = new ClaimsPrincipal(identity);
        var ticket = new AuthenticationTicket(principal, Scheme.Name);

        return Task.FromResult(AuthenticateResult.Success(ticket));
    }

    protected override Task HandleChallengeAsync(AuthenticationProperties properties)
    {
        var hasToken = !string.IsNullOrWhiteSpace(AuthTokenReader.ReadToken(Context));
        var code = hasToken ? AppErrorCodes.AuthTokenInvalid : AppErrorCodes.AuthTokenRequired;
        var detail = hasToken
            ? "Authentication token is invalid or has expired."
            : "Authentication token is required.";

        return WriteProblemDetailsAsync(
            StatusCodes.Status401Unauthorized,
            "Unauthorized",
            detail,
            code,
            "https://httpstatuses.com/401");
    }

    protected override Task HandleForbiddenAsync(AuthenticationProperties properties)
    {
        return WriteProblemDetailsAsync(
            StatusCodes.Status403Forbidden,
            "Forbidden",
            "You do not have permission to access this resource.",
            AppErrorCodes.Forbidden,
            "https://httpstatuses.com/403");
    }

    private async Task WriteProblemDetailsAsync(
        int statusCode,
        string title,
        string detail,
        string code,
        string type)
    {
        if (Response.HasStarted)
        {
            return;
        }

        Response.StatusCode = statusCode;
        Response.ContentType = "application/problem+json; charset=utf-8";

        var problemDetails = new ProblemDetails
        {
            Title = title,
            Detail = detail,
            Status = statusCode,
            Type = type,
            Instance = Request.Path
        };

        problemDetails.Extensions["code"] = code;
        problemDetails.Extensions["traceId"] = Context.TraceIdentifier;

        await Response.WriteAsJsonAsync(problemDetails, Context.RequestAborted);
    }
}
