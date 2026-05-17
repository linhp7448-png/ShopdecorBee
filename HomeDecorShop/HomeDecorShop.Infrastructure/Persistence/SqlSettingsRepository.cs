using Microsoft.EntityFrameworkCore;
using HomeDecorShop.Domain;
using HomeDecorShop.Application;

namespace HomeDecorShop.Infrastructure;

public class SqlSettingsRepository(AppDbContext db) : ISettingsRepository
{
    public async Task<SystemSetting?> GetSettingsAsync() =>
        await db.SystemSettings.FirstOrDefaultAsync();

    public async Task<SystemSetting> UpdateSettingsAsync(SystemSetting settings)
    {
        db.SystemSettings.Update(settings);
        await db.SaveChangesAsync();
        return settings;
    }
}
