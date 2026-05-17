namespace HomeDecorShop.API;

internal static class AuthTokenReader
{
    public static string ReadToken(HttpContext context)
    {
        if (context.Request.Headers.TryGetValue("X-Auth-Token", out var token))
        {
            return token.ToString();
        }

        if (context.Request.Headers.TryGetValue("Authorization", out var auth))
        {
            var value = auth.ToString();
            const string prefix = "Bearer ";
            if (value.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
            {
                return value[prefix.Length..].Trim();
            }
        }

        return string.Empty;
    }
}
