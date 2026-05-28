using HomeDecorShop.Domain;

namespace HomeDecorShop.Application;

public interface ISettingsService
{
    Task<SystemSetting> GetSettingsAsync();
    Task<SystemSetting> UpdateSettingsAsync(SystemSetting settings);
}
