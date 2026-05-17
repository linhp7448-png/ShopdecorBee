using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace HomeDecorShop.API.Controllers;

[ApiController]
[Route("api/upload")]
[Authorize(Roles = ApiAuthenticationDefaults.AdminRole)]
public sealed class UploadController : ApiControllerBase
{
    private readonly IWebHostEnvironment _environment;

    public UploadController(IWebHostEnvironment environment)
    {
        _environment = environment;
    }

    [HttpPost("image")]
    public async Task<ActionResult<UploadResponse>> UploadImage(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("No file uploaded.");

        var uploadsPath = Path.Combine(_environment.WebRootPath, "uploads");
        if (!Directory.Exists(uploadsPath))
            Directory.CreateDirectory(uploadsPath);

        var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
        var filePath = Path.Combine(uploadsPath, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var url = $"/uploads/{fileName}";
        return Ok(new UploadResponse(url));
    }
}

public sealed record UploadResponse(string Url);
