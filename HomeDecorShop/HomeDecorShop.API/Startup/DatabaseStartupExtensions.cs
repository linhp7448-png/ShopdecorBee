using HomeDecorShop.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace HomeDecorShop.API;

internal static class DatabaseStartupExtensions
{
    public static void InitializeDatabase(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();

        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        db.Database.Migrate();
    }
}
