using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.ApiExplorer;
using Microsoft.OpenApi;
using Swashbuckle.AspNetCore.SwaggerGen;
using HttpMethod = System.Net.Http.HttpMethod;

namespace HomeDecorShop.API;

internal sealed class AuthorizeDocumentFilter : IDocumentFilter
{
    public void Apply(OpenApiDocument swaggerDoc, DocumentFilterContext context)
    {
        foreach (var apiDescription in context.ApiDescriptions)
        {
            if (!TryGetOperation(swaggerDoc, apiDescription, out var operation))
            {
                continue;
            }

            var metadata = apiDescription.ActionDescriptor.EndpointMetadata;
            var hasAllowAnonymous = metadata.OfType<AllowAnonymousAttribute>().Any();
            if (hasAllowAnonymous)
            {
                operation.Security = new List<OpenApiSecurityRequirement>();
                continue;
            }

            var hasAuthorize = metadata.OfType<IAuthorizeData>().Any();
            if (!hasAuthorize)
            {
                continue;
            }

            operation.Security = new List<OpenApiSecurityRequirement>
            {
                new()
                {
                    [
                        new OpenApiSecuritySchemeReference(
                            ApiAuthenticationDefaults.SwaggerScheme,
                            swaggerDoc,
                            null!)
                    ] = new List<string>()
                }
            };
        }
    }

    private static bool TryGetOperation(
        OpenApiDocument swaggerDoc,
        ApiDescription apiDescription,
        out OpenApiOperation operation)
    {
        operation = null!;

        if (!TryGetOperationType(apiDescription.HttpMethod, out var operationType))
        {
            return false;
        }

        var path = NormalizePath(apiDescription.RelativePath);
        if (!swaggerDoc.Paths.TryGetValue(path, out var pathItem))
        {
            return false;
        }

        if (pathItem?.Operations is null)
        {
            return false;
        }

        if (!pathItem.Operations.TryGetValue(operationType, out var matchedOperation) || matchedOperation is null)
        {
            return false;
        }

        operation = matchedOperation;
        return true;
    }

    private static string NormalizePath(string? relativePath)
    {
        if (string.IsNullOrWhiteSpace(relativePath))
        {
            return "/";
        }

        var pathWithoutQuery = relativePath.Split('?', 2)[0].Trim('/');
        if (string.IsNullOrEmpty(pathWithoutQuery))
        {
            return "/";
        }

        var segments = pathWithoutQuery
            .Split('/', StringSplitOptions.RemoveEmptyEntries)
            .Select(NormalizePathSegment);

        return $"/{string.Join('/', segments)}";
    }

    private static string NormalizePathSegment(string segment)
    {
        if (!segment.StartsWith('{') || !segment.EndsWith('}'))
        {
            return segment;
        }

        var colonIndex = segment.IndexOf(':');
        return colonIndex > 0
            ? $"{segment[..colonIndex]}}}"
            : segment;
    }

    private static bool TryGetOperationType(string? httpMethod, out HttpMethod operationType)
    {
        switch (httpMethod?.ToUpperInvariant())
        {
            case "GET":
                operationType = HttpMethod.Get;
                return true;
            case "POST":
                operationType = HttpMethod.Post;
                return true;
            case "PUT":
                operationType = HttpMethod.Put;
                return true;
            case "DELETE":
                operationType = HttpMethod.Delete;
                return true;
            case "PATCH":
                operationType = HttpMethod.Patch;
                return true;
            case "HEAD":
                operationType = HttpMethod.Head;
                return true;
            case "OPTIONS":
                operationType = HttpMethod.Options;
                return true;
            case "TRACE":
                operationType = HttpMethod.Trace;
                return true;
            default:
                operationType = HttpMethod.Get;
                return false;
        }
    }
}
