using Microsoft.AspNetCore.Authentication;

namespace HomeDecorShop.API;

internal static class AuthenticationStartupExtensions
{
    public static IServiceCollection AddApiAuthentication(this IServiceCollection services)
    {
        services
            .AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = ApiAuthenticationDefaults.Scheme;
                options.DefaultChallengeScheme = ApiAuthenticationDefaults.Scheme;
            })
            .AddScheme<AuthenticationSchemeOptions, TokenAuthenticationHandler>(
                ApiAuthenticationDefaults.Scheme,
                _ => { });

        services.AddAuthorization();

        return services;
    }
}
