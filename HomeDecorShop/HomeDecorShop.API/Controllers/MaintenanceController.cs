
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HomeDecorShop.Infrastructure;
using System.Text.RegularExpressions;
using Swashbuckle.AspNetCore.Annotations;

namespace HomeDecorShop.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [SwaggerTag("Internal maintenance and explicit seed operations.")]
    public class MaintenanceController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MaintenanceController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("seed/categories")]
        [SwaggerOperation(
            Summary = "Seed product categories",
            Description = "Explicitly inserts or updates the demo category catalog. Startup no longer seeds categories automatically.")]
        public IActionResult SeedCategories()
        {
            SeedDataMaintenance.EnsureCategories(_context);

            return Ok(new
            {
                Message = "Categories seeded.",
                TotalGroups = _context.CategoryGroups.Count(),
                TotalCategories = _context.Categories.Count(),
                SeedItems = CategoryCatalogSeedData.BuildCatalog().Count
            });
        }

        [HttpPost("seed/products")]
        [SwaggerOperation(
            Summary = "Seed products",
            Description = "Explicitly inserts or updates the demo product catalog. Categories are ensured first if missing.")]
        public IActionResult SeedProducts()
        {
            SeedDataMaintenance.EnsureProductCatalog(_context);

            return Ok(new
            {
                Message = "Products seeded.",
                TotalProducts = _context.Products.Count(),
                SeedItems = ProductCatalogSeedData.BuildCatalog().Count
            });
        }

        [HttpPost("seed/catalog")]
        [SwaggerOperation(
            Summary = "Seed products (legacy alias)",
            Description = "Backward-compatible alias for /api/Maintenance/seed/products.")]
        public IActionResult SeedCatalog() => SeedProducts();

        [HttpPost("seed/system")]
        [SwaggerOperation(
            Summary = "Seed system settings and admin",
            Description = "Ensures the default system settings row and admin account exist.")]
        public IActionResult SeedSystem()
        {
            SeedDataMaintenance.EnsureSystemSettings(_context);
            SeedDataMaintenance.EnsureAdminUser(_context);

            return Ok(new
            {
                Message = "System settings and admin ensured.",
                HasSettings = _context.SystemSettings.Any(),
                HasAdmin = _context.Users.Any(user => user.Email == "admin1@homedecorshop.local")
            });
        }

        [HttpPost("seed/all")]
        [SwaggerOperation(
            Summary = "Seed all demo data",
            Description = "Ensures settings, admin account and the full demo product catalog in one call.")]
        public IActionResult SeedAll()
        {
            SeedDataMaintenance.SeedAll(_context);

            return Ok(new
            {
                Message = "Demo data seeded.",
                TotalGroups = _context.CategoryGroups.Count(),
                TotalCategories = _context.Categories.Count(),
                TotalProducts = _context.Products.Count(),
                TotalSettings = _context.SystemSettings.Count(),
                TotalUsers = _context.Users.Count()
            });
        }

        [HttpPost("update-descriptions")]
        public async Task<IActionResult> UpdateDescriptions()
        {
            try
            {
                string filePath = @"c:\Users\Dell\OneDrive\Desktop\TMDT_Nhom6\SanPham.txt";
                if (!System.IO.File.Exists(filePath)) return NotFound("SanPham.txt not found");

                string text = await System.IO.File.ReadAllTextAsync(filePath);
                var products = text.Split(new[] { "===== SẢN PHẨM" }, StringSplitOptions.RemoveEmptyEntries);
                
                int updatedCount = 0;
                foreach (var p in products)
                {
                    var match = Regex.Match(p, @"^ \d+: (.*?) =====\s+Mô tả:\s+(.*?)\s+Thông số:\s+(.*?)\s+Chất liệu:\s+(.*?)\s+Phong cách:\s+(.*?)\s+Giá:", RegexOptions.Singleline);
                    if (match.Success)
                    {
                        string name = match.Groups[1].Value.Trim();
                        string description = match.Groups[2].Value.Trim();
                        string specs = match.Groups[3].Value.Trim();
                        string material = match.Groups[4].Value.Trim();
                        string style = match.Groups[5].Value.Trim();
                        
                        string fullDesc = $"{description}\n\n[THÔNG SỐ]\n{specs}\n\n[CHẤT LIỆU]: {material}\n[PHONG CÁCH]: {style}";
                        
                        var dbProduct = await _context.Products.FirstOrDefaultAsync(x => x.ProductName.Contains(name));
                        if (dbProduct != null)
                        {
                            dbProduct.Description = fullDesc;
                            dbProduct.Material = material;
                            dbProduct.Style = style;
                            updatedCount++;
                        }
                    }
                }

                await _context.SaveChangesAsync();
                return Ok($"Updated {updatedCount} products.");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
