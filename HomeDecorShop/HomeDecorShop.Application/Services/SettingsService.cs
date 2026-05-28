using HomeDecorShop.Domain;

namespace HomeDecorShop.Application;

public class SettingsService(ISettingsRepository repository) : ISettingsService
{
    public async Task<SystemSetting> GetSettingsAsync()
    {
        var settings = await repository.GetSettingsAsync();
        if (settings == null)
        {
            // Fallback if seed failed
            settings = new SystemSetting { Id = 1 };
            await repository.UpdateSettingsAsync(settings);
        }
        return settings;
    }

    public async Task<SystemSetting> UpdateSettingsAsync(SystemSetting settings)
    {
        settings.UpdatedAt = DateTime.UtcNow;
        return await repository.UpdateSettingsAsync(settings);
    }
}
