using HomeDecorShop.Application;
using HomeDecorShop.Domain;
using Microsoft.AspNetCore.Mvc;

namespace HomeDecorShop.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class SettingsController(ISettingsService settingsService) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<SystemSetting>> GetSettings()
    {
        return Ok(await settingsService.GetSettingsAsync());
    }

    [HttpPut]
    public async Task<ActionResult<SystemSetting>> UpdateSettings(SystemSetting settings)
    {
        return Ok(await settingsService.UpdateSettingsAsync(settings));
    }
}
