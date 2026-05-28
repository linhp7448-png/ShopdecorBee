using Microsoft.OpenApi;
using Swashbuckle.AspNetCore.Annotations;

namespace HomeDecorShop.API;

internal static class SwaggerStartupExtensions
{
    public static IServiceCollection AddApiSwagger(this IServiceCollection services)
    {
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(options =>
        {
            options.EnableAnnotations();
            options.SupportNonNullableReferenceTypes();
            options.AddSecurityDefinition(ApiAuthenticationDefaults.SwaggerScheme, new OpenApiSecurityScheme
            {
                Name = "Authorization",
                Type = SecuritySchemeType.Http,
                Scheme = "bearer",
                BearerFormat = "Token",
                In = ParameterLocation.Header,
                Description = "Nhap access token da dang nhap. Swagger se gui header dang Authorization: Bearer <token>."
            });
            options.DocumentFilter<AuthorizeDocumentFilter>();
            options.OperationFilter<AuthorizeOperationFilter>();
        });

        return services;
    }
}
