using Microsoft.AspNetCore.Authorization;
using Microsoft.OpenApi;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace HomeDecorShop.API;

internal sealed class AuthorizeOperationFilter : IOperationFilter
{
    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        var metadata = context.ApiDescription.ActionDescriptor.EndpointMetadata;
        var hasAllowAnonymous = metadata.OfType<AllowAnonymousAttribute>().Any();
        if (hasAllowAnonymous)
        {
            return;
        }

        var hasAuthorize = metadata.OfType<IAuthorizeData>().Any();
        if (!hasAuthorize)
        {
            return;
        }

        operation.Responses ??= new OpenApiResponses();
        operation.Responses.TryAdd("401", new OpenApiResponse { Description = "Unauthorized" });
        operation.Responses.TryAdd("403", new OpenApiResponse { Description = "Forbidden" });
    }
}
