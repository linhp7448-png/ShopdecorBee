using HomeDecorShop.Application;
using HomeDecorShop.API.ExceptionHandling;
using Microsoft.AspNetCore.Mvc;

namespace HomeDecorShop.API;

internal static class ExceptionHandlingStartupExtensions
{
    public static IServiceCollection AddApiExceptionHandling(this IServiceCollection services)
    {
        services.AddProblemDetails(options =>
        {
            options.CustomizeProblemDetails = context =>
            {
                context.ProblemDetails.Instance ??= context.HttpContext.Request.Path;
                context.ProblemDetails.Extensions["code"] ??= context.ProblemDetails.Status switch
                {
                    StatusCodes.Status400BadRequest => AppErrorCodes.ValidationFailed,
                    StatusCodes.Status401Unauthorized => AppErrorCodes.Unauthorized,
                    StatusCodes.Status403Forbidden => AppErrorCodes.Forbidden,
                    StatusCodes.Status404NotFound => AppErrorCodes.ResourceNotFound,
                    StatusCodes.Status409Conflict => AppErrorCodes.Conflict,
                    _ => AppErrorCodes.InternalServerError
                };
                context.ProblemDetails.Extensions["traceId"] = context.HttpContext.TraceIdentifier;
            };
        });

        services.AddExceptionHandler<ApiExceptionHandler>();

        return services;
    }

    public static IMvcBuilder AddApiControllers(this IServiceCollection services)
    {
        return services
            .AddControllers()
            .ConfigureApiBehaviorOptions(options =>
            {
                options.InvalidModelStateResponseFactory = context =>
                {
                    var problemDetails = new ValidationProblemDetails(context.ModelState)
                    {
                        Title = "Validation failed",
                        Detail = "One or more request fields are invalid.",
                        Status = StatusCodes.Status400BadRequest,
                        Type = "https://httpstatuses.com/400",
                        Instance = context.HttpContext.Request.Path
                    };
                    problemDetails.Extensions["code"] = AppErrorCodes.ValidationFailed;
                    problemDetails.Extensions["traceId"] = context.HttpContext.TraceIdentifier;

                    return new BadRequestObjectResult(problemDetails);
                };
            });
    }
}
