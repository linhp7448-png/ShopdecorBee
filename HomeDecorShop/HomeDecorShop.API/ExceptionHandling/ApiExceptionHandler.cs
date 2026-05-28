using HomeDecorShop.Application;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace HomeDecorShop.API.ExceptionHandling;

internal sealed class ApiExceptionHandler(
    ILogger<ApiExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        var (problemDetails, code) = CreateProblemDetails(httpContext, exception);
        httpContext.Response.StatusCode = problemDetails.Status ?? StatusCodes.Status500InternalServerError;
        httpContext.Response.ContentType = "application/problem+json; charset=utf-8";
        problemDetails.Extensions["code"] = code;
        problemDetails.Extensions["traceId"] = httpContext.TraceIdentifier;

        if (problemDetails.Status >= 500)
        {
            logger.LogError(
                exception,
                "Unhandled exception for {Method} {Path} returned {StatusCode}.",
                httpContext.Request.Method,
                httpContext.Request.Path,
                problemDetails.Status);
        }
        else
        {
            logger.LogWarning(
                exception,
                "Handled exception for {Method} {Path} returned {StatusCode}.",
                httpContext.Request.Method,
                httpContext.Request.Path,
                problemDetails.Status);
        }

        await httpContext.Response.WriteAsJsonAsync(problemDetails, cancellationToken);
        return true;
    }

    private static (ProblemDetails ProblemDetails, string Code) CreateProblemDetails(HttpContext httpContext, Exception exception)
    {
        if (exception is RequestValidationException validationException)
        {
            return (new HttpValidationProblemDetails(validationException.Errors)
            {
                Title = validationException.Title,
                Detail = validationException.Message,
                Status = validationException.StatusCode,
                Type = validationException.Type,
                Instance = httpContext.Request.Path
            }, validationException.Code);
        }

        if (exception is AppException appException)
        {
            return (new ProblemDetails
            {
                Title = appException.Title,
                Detail = appException.Message,
                Status = appException.StatusCode,
                Type = appException.Type,
                Instance = httpContext.Request.Path
            }, appException.Code);
        }

        return (new ProblemDetails
        {
            Title = "Internal server error",
            Detail = "An unexpected error occurred while processing the request.",
            Status = StatusCodes.Status500InternalServerError,
            Type = "https://httpstatuses.com/500",
            Instance = httpContext.Request.Path
        }, AppErrorCodes.InternalServerError);
    }
}
