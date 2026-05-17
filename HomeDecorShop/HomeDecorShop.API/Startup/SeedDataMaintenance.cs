using HomeDecorShop.Domain;
using HomeDecorShop.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace HomeDecorShop.API;

internal static class SeedDataMaintenance
{
    private const string AdminEmail = "admin1@homedecorshop.local";
    private const string LegacyAdminEmail = "admin1";
    private const string AdminPassword = "admin123";

    public static void SeedAll(AppDbContext db)
    {
        EnsureSystemSettings(db);
        EnsureAdminUser(db);
        EnsureCategories(db);
        EnsureProductCatalog(db);
    }

    public static void EnsureCategories(AppDbContext db)
    {
        var categoryGroups = db.CategoryGroups
            .AsNoTracking()
            .OrderBy(group => group.Id)
            .ToList();

        var groupsBySlug = new Dictionary<string, CategoryGroup>(StringComparer.OrdinalIgnoreCase);

        foreach (var group in categoryGroups)
        {
            if (!groupsBySlug.TryAdd(group.Slug, group))
            {
                var canonicalGroup = groupsBySlug[group.Slug];
                ReassignCategoriesToGroup(db, group.Id, canonicalGroup);
                db.Database.ExecuteSqlInterpolated($"DELETE FROM [CategoryGroups] WHERE [Id] = {group.Id}");
            }
        }

        db.ChangeTracker.Clear();
        groupsBySlug = db.CategoryGroups
            .OrderBy(group => group.DisplayOrder)
            .ThenBy(group => group.Id)
            .ToDictionary(group => group.Slug, StringComparer.OrdinalIgnoreCase);

        var seedGroups = CategoryCatalogSeedData.BuildGroups();

        foreach (var seedGroup in seedGroups)
        {
            if (!groupsBySlug.TryGetValue(seedGroup.Slug, out var group))
            {
                group = new CategoryGroup();
                db.CategoryGroups.Add(group);
                groupsBySlug[seedGroup.Slug] = group;
            }

            group.Name = seedGroup.Name;
            group.Slug = seedGroup.Slug;
            group.DisplayOrder = seedGroup.DisplayOrder;
            group.IsActive = seedGroup.IsActive;
        }

        db.SaveChanges();
        db.ChangeTracker.Clear();

        groupsBySlug = db.CategoryGroups
            .OrderBy(group => group.DisplayOrder)
            .ThenBy(group => group.Id)
            .ToDictionary(group => group.Slug, StringComparer.OrdinalIgnoreCase);

        var categories = db.Categories
            .AsNoTracking()
            .OrderBy(category => category.Id)
            .ToList();

        var categoriesBySlug = new Dictionary<string, Category>(StringComparer.OrdinalIgnoreCase);

        foreach (var category in categories)
        {
            if (!categoriesBySlug.TryAdd(category.Slug, category))
            {
                var canonicalCategory = categoriesBySlug[category.Slug];
                ReassignProducts(db, category.Id, canonicalCategory);
                db.Database.ExecuteSqlInterpolated($"DELETE FROM [Categories] WHERE [Id] = {category.Id}");
            }
        }

        db.ChangeTracker.Clear();
        categoriesBySlug = db.Categories
            .OrderBy(category => category.Id)
            .ToDictionary(category => category.Slug, StringComparer.OrdinalIgnoreCase);

        var seedCategories = CategoryCatalogSeedData.BuildCatalog();

        foreach (var seed in seedCategories)
        {
            if (!groupsBySlug.TryGetValue(seed.GroupSlug, out var group))
            {
                throw new InvalidOperationException($"Seed category group '{seed.GroupSlug}' does not exist.");
            }

            if (!categoriesBySlug.TryGetValue(seed.Slug, out var category))
            {
                category = new Category();
                db.Categories.Add(category);
                categoriesBySlug[seed.Slug] = category;
            }

            category.Name = seed.Name;
            category.Slug = seed.Slug;
            category.GroupId = group.Id;
            category.IsActive = seed.IsActive;
        }

        db.SaveChanges();
        RemoveObsoleteCategories(db);
        RemoveObsoleteCategoryGroups(db);
    }

    public static void EnsureProductCatalog(AppDbContext db)
    {
        EnsureCategories(db);

        var categoriesByName = db.Categories
            .AsNoTracking()
            .OrderBy(category => category.Id)
            .ToList()
            .GroupBy(category => category.Name, StringComparer.OrdinalIgnoreCase)
            .ToDictionary(group => group.Key, group => group.First(), StringComparer.OrdinalIgnoreCase);

        var productsBySku = db.Products
            .ToDictionary(product => product.Sku, StringComparer.OrdinalIgnoreCase);

        var catalog = ProductCatalogSeedData.BuildCatalog();

        for (var index = 0; index < catalog.Count; index++)
        {
            var seed = catalog[index];
            var sku = ProductCatalogSeedData.CreateSku(index + 1);
            var slug = ProductCatalogSeedData.CreateSlug(seed.Name, index + 1);

            if (!categoriesByName.TryGetValue(seed.Category, out var category))
            {
                throw new InvalidOperationException($"Seed category '{seed.Category}' does not exist.");
            }

            if (!productsBySku.TryGetValue(sku, out var product))
            {
                product = new Product
                {
                    Sku = sku,
                    CreatedAt = DateTime.UtcNow.AddMinutes(-(catalog.Count - index))
                };

                db.Products.Add(product);
                productsBySku[sku] = product;
            }

            product.Sku = sku;
            product.ProductName = seed.Name;
            product.Slug = slug;
            product.Price = seed.Price;
            product.OldPrice = seed.OldPrice;
            product.CategoryId = category.Id;
            product.Category = category.Name;
            product.Image = seed.Image;
            product.HoverImage = seed.HoverImage;
            product.VideoUrl = null;
            product.Tag = seed.Tag;
            product.SoldPercentage = null;
            product.StockLeft = seed.StockLeft;
            product.Rating = seed.Rating;
            product.Reviews = seed.Reviews;
            product.Brand = seed.Brand;
            product.Color = seed.Color;
            product.Material = seed.Material;
            product.Style = seed.Style;
            product.InStock = seed.StockLeft > 0;
            product.IsActive = true;
            product.Description = seed.Description;

            if (product.CreatedAt == default)
            {
                product.CreatedAt = DateTime.UtcNow.AddMinutes(-(catalog.Count - index));
            }
        }

        db.SaveChanges();
        RemoveObsoleteCategories(db);
        RemoveObsoleteCategoryGroups(db);
    }

    public static void EnsureSystemSettings(AppDbContext db)
    {
        if (db.SystemSettings.Any())
        {
            return;
        }

        db.SystemSettings.Add(new SystemSetting
        {
            StoreName = "BeeShop",
            VatPercentage = 10,
            DefaultShippingFee = 30000,
            ContactEmail = "support@homedecorshop.local",
            ContactPhone = "0123456789",
            Address = "BeeShop Demo Store",
            UpdatedAt = DateTime.UtcNow
        });

        db.SaveChanges();
    }

    public static void EnsureAdminUser(AppDbContext db)
    {
        var admin = db.Users
            .Include(user => user.Addresses)
            .FirstOrDefault(user => user.Email == AdminEmail);

        if (admin is null)
        {
            admin = db.Users
                .Include(user => user.Addresses)
                .FirstOrDefault(user => user.Email == LegacyAdminEmail);
        }

        if (admin is not null)
        {
            var shouldSave = false;

            if (admin.Email != AdminEmail)
            {
                admin.Email = AdminEmail;
                shouldSave = true;
            }

            if (admin.Role != UserRole.Admin)
            {
                admin.Role = UserRole.Admin;
                shouldSave = true;
            }

            if (!admin.IsActive)
            {
                admin.IsActive = true;
                shouldSave = true;
            }

            if (!admin.IsEmailConfirmed)
            {
                admin.IsEmailConfirmed = true;
                shouldSave = true;
            }

            if (string.IsNullOrWhiteSpace(admin.CurrentToken))
            {
                admin.CurrentToken = Guid.NewGuid().ToString("N");
                shouldSave = true;
            }

            if (shouldSave)
            {
                db.SaveChanges();
            }

            return;
        }

        db.Users.Add(new User
        {
            Email = AdminEmail,
            FullName = "Administrator",
            Phone = "0123456789",
            Address = "BeeShop Demo Store",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(AdminPassword),
            Role = UserRole.Admin,
            CreatedAt = DateTime.UtcNow,
            IsActive = true,
            CurrentToken = Guid.NewGuid().ToString("N"),
            IsEmailConfirmed = true,
            EmailConfirmationToken = null,
            Addresses = []
        });

        db.SaveChanges();
    }

    private static void RemoveObsoleteCategories(AppDbContext db)
    {
        var expectedSlugs = CategoryCatalogSeedData.BuildCatalog()
            .Select(category => category.Slug)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        var categories = db.Categories
            .ToList();

        foreach (var category in categories.Where(category => !expectedSlugs.Contains(category.Slug)))
        {
            var isReferenced = db.Products.Any(product => product.CategoryId == category.Id);
            if (isReferenced)
            {
                category.IsActive = false;
                continue;
            }

            db.Categories.Remove(category);
        }

        db.SaveChanges();
    }

    private static void RemoveObsoleteCategoryGroups(AppDbContext db)
    {
        var expectedSlugs = CategoryCatalogSeedData.BuildGroups()
            .Select(group => group.Slug)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        var groups = db.CategoryGroups.ToList();

        foreach (var group in groups.Where(group => !expectedSlugs.Contains(group.Slug)))
        {
            var isReferenced = db.Categories.Any(category => category.GroupId == group.Id);
            if (isReferenced)
            {
                group.IsActive = false;
                continue;
            }

            db.CategoryGroups.Remove(group);
        }

        db.SaveChanges();
    }

    private static void ReassignProducts(AppDbContext db, int sourceCategoryId, Category targetCategory) =>
        db.Database.ExecuteSqlInterpolated(
            $@"UPDATE [Products]
               SET [CategoryId] = {targetCategory.Id},
                   [Category] = {targetCategory.Name}
               WHERE [CategoryId] = {sourceCategoryId}");

    private static void ReassignCategoriesToGroup(AppDbContext db, int sourceGroupId, CategoryGroup targetGroup) =>
        db.Database.ExecuteSqlInterpolated(
            $@"UPDATE [Categories]
               SET [GroupId] = {targetGroup.Id}
               WHERE [GroupId] = {sourceGroupId}");
}
