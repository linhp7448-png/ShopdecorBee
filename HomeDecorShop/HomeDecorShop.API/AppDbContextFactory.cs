using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using HomeDecorShop.Infrastructure;

namespace HomeDecorShop.API;

public sealed class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
        optionsBuilder.UseSqlServer(DesignTimeConnectionStringResolver.Resolve());

        return new AppDbContext(optionsBuilder.Options);
    }
}
