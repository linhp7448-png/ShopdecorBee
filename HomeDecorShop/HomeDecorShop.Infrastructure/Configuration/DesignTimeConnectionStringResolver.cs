using System.Text.Json;

namespace HomeDecorShop.Infrastructure;

public static class DesignTimeConnectionStringResolver
{
    private const string ConnectionStringName = "DefaultConnection";

    public static string Resolve()
    {
        var environmentOverride = Environment.GetEnvironmentVariable($"ConnectionStrings__{ConnectionStringName}");
        if (!string.IsNullOrWhiteSpace(environmentOverride))
        {
            return environmentOverride;
        }

        var apiProjectDirectory = FindApiProjectDirectory();
        var connectionString = ReadConnectionString(Path.Combine(apiProjectDirectory, "appsettings.json"));
        var environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT")
            ?? Environment.GetEnvironmentVariable("DOTNET_ENVIRONMENT");

        if (!string.IsNullOrWhiteSpace(environment))
        {
            var environmentSpecificConnectionString = ReadConnectionString(
                Path.Combine(apiProjectDirectory, $"appsettings.{environment}.json"));

            if (!string.IsNullOrWhiteSpace(environmentSpecificConnectionString))
            {
                connectionString = environmentSpecificConnectionString;
            }
        }

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException(
                "Could not resolve ConnectionStrings:DefaultConnection from HomeDecorShop.API/appsettings.json.");
        }

        return connectionString;
    }

    private static string? ReadConnectionString(string path)
    {
        if (!File.Exists(path))
        {
            return null;
        }

        using var stream = File.OpenRead(path);
        using var document = JsonDocument.Parse(stream);

        if (!document.RootElement.TryGetProperty("ConnectionStrings", out var connectionStrings) ||
            connectionStrings.ValueKind != JsonValueKind.Object)
        {
            return null;
        }

        if (!connectionStrings.TryGetProperty(ConnectionStringName, out var connectionString) ||
            connectionString.ValueKind != JsonValueKind.String)
        {
            return null;
        }

        return connectionString.GetString();
    }

    private static string FindApiProjectDirectory()
    {
        foreach (var startDirectory in GetStartDirectories())
        {
            var apiProjectDirectory = SearchUpForApiProjectDirectory(startDirectory);
            if (!string.IsNullOrWhiteSpace(apiProjectDirectory))
            {
                return apiProjectDirectory;
            }
        }

        throw new InvalidOperationException(
            "Could not locate the HomeDecorShop.API directory to resolve the design-time connection string.");
    }

    private static IEnumerable<string> GetStartDirectories()
    {
        yield return Directory.GetCurrentDirectory();
        yield return AppContext.BaseDirectory;
    }

    private static string? SearchUpForApiProjectDirectory(string startDirectory)
    {
        if (string.IsNullOrWhiteSpace(startDirectory) || !Directory.Exists(startDirectory))
        {
            return null;
        }

        var current = new DirectoryInfo(startDirectory);
        while (current is not null)
        {
            var nestedApiDirectory = Path.Combine(current.FullName, "HomeDecorShop.API");
            if (File.Exists(Path.Combine(nestedApiDirectory, "HomeDecorShop.API.csproj")) &&
                File.Exists(Path.Combine(nestedApiDirectory, "appsettings.json")))
            {
                return nestedApiDirectory;
            }

            if (File.Exists(Path.Combine(current.FullName, "HomeDecorShop.API.csproj")) &&
                File.Exists(Path.Combine(current.FullName, "appsettings.json")))
            {
                return current.FullName;
            }

            current = current.Parent;
        }

        return null;
    }
}
