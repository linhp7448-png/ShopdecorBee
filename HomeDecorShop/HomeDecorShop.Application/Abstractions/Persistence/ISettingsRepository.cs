using HomeDecorShop.Domain;

namespace HomeDecorShop.Application;

public interface ISettingsRepository
{
    Task<SystemSetting?> GetSettingsAsync();
    Task<SystemSetting> UpdateSettingsAsync(SystemSetting settings);
}
