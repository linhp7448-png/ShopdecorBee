using HomeDecorShop.Domain;

namespace HomeDecorShop.Application;

public sealed class ProductService(
    IProductRepository repository, 
    ICategoryRepository categoryRepository, 
    IProductReviewRepository reviewRepository) : IProductService
{
    public ProductView? GetById(int id)
    {
        var product = repository.GetById(id);
        return product is null ? null : MapProduct(product);
    }

    public ProductListResult Search(ProductQuery input)
    {
        var page = Math.Max(input.Page, 1);
        var pageSize = Math.Clamp(input.PageSize, 1, 100);
        var normalizedSort = Normalize(input.SortBy);
        var normalizedQuery = Normalize(input.Query);
        var categories = ParseList(input.Category);
        var brands = ParseList(input.Brand);
        var styles = ParseList(input.Style);

        IEnumerable<Product> query = repository.GetAll();
        
        if (!input.IncludeInactive)
        {
            query = query.Where(product => product.IsActive && (product.CategoryNavigation?.IsActive ?? true));
        }

        if (!string.IsNullOrWhiteSpace(normalizedQuery))
        {
            query = query.Where(product => MatchesSearch(product, normalizedQuery));
        }

        if (categories.Count > 0)
        {
            query = query.Where(product => MatchesCategory(product, categories));
        }

        if (brands.Count > 0)
        {
            query = query.Where(product => brands.Contains(Normalize(product.Brand)));
        }

        if (styles.Count > 0)
        {
            query = query.Where(product => styles.Contains(Normalize(product.Style)));
        }

        if (input.MinPrice is not null)
        {
            query = query.Where(product => product.Price >= input.MinPrice.Value);
        }

        if (input.MaxPrice is not null)
        {
            query = query.Where(product => product.Price <= input.MaxPrice.Value);
        }

        if (input.InStockOnly)
        {
            query = query.Where(IsInStock);
        }

        if (input.OnSaleOnly)
        {
            query = query.Where(IsOnSale);
        }

        if (input.RatingGte is not null)
        {
            var minRating = Math.Clamp(input.RatingGte.Value, 0, 5);
            query = query.Where(product => product.Rating >= minRating);
        }

        var sorted = ApplySorting(query, normalizedSort, normalizedQuery).ToArray();
        var total = sorted.Length;
        var items = sorted
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(MapProduct)
            .ToArray();

        var sortBy = string.IsNullOrWhiteSpace(normalizedSort) ? "relevance" : normalizedSort;
        return new ProductListResult(items, total, page, pageSize, sortBy);
    }

    public ProductView Create(ProductUpsertInput input)
    {
        var category = RequireActiveCategory(input.CategoryId);
        ValidatePricing(input.Price, input.OriginalPrice);
        var normalizedSku = NormalizeSku(input.Sku);
        var normalizedSlug = NormalizeSlug(input.Slug);
        EnsureUniqueSku(normalizedSku, null);
        EnsureUniqueSlug(normalizedSlug, null);

        var now = DateTime.UtcNow;
        var product = new Product
        {
            ProductId = 0,
            Sku = normalizedSku,
            ProductName = input.Name.Trim(),
            Slug = normalizedSlug,
            Price = input.Price,
            OldPrice = input.OriginalPrice,
            CategoryId = category.Id,
            Category = category.Name,
            Image = input.Image.Trim(),
            HoverImage = input.HoverImage.Trim(),
            VideoUrl = NormalizeOptional(input.VideoUrl),
            Tag = NormalizeOptional(input.Tag),
            SoldPercentage = input.SoldPercentage,
            StockLeft = Math.Max(input.StockLeft, 0),
            Rating = Math.Clamp(input.Rating, 0, 5),
            Reviews = Math.Max(input.Reviews, 0),
            Brand = input.Brand.Trim(),
            Color = input.Color.Trim(),
            Material = input.Material.Trim(),
            Style = input.Style.Trim(),
            InStock = input.StockLeft > 0,
            IsActive = input.IsActive,
            CreatedAt = now
        };

        var created = repository.Create(product);
        return MapProduct(repository.GetById(created.ProductId) ?? created);
    }

    public ProductView? Update(int id, ProductUpsertInput input)
    {
        var existing = repository.GetById(id);
        if (existing is null)
        {
            return null;
        }

        var category = RequireActiveCategory(input.CategoryId);
        ValidatePricing(input.Price, input.OriginalPrice);
        var normalizedSku = NormalizeSku(input.Sku);
        var normalizedSlug = NormalizeSlug(input.Slug);
        EnsureUniqueSku(normalizedSku, id);
        EnsureUniqueSlug(normalizedSlug, id);

        existing.Sku = normalizedSku;
        existing.ProductName = input.Name.Trim();
        existing.Slug = normalizedSlug;
        existing.Price = input.Price;
        existing.OldPrice = input.OriginalPrice;
        existing.CategoryId = category.Id;
        existing.Category = category.Name;
        existing.Image = input.Image.Trim();
        existing.HoverImage = input.HoverImage.Trim();
        existing.VideoUrl = NormalizeOptional(input.VideoUrl);
        existing.Tag = NormalizeOptional(input.Tag);
        existing.SoldPercentage = input.SoldPercentage;
        existing.StockLeft = Math.Max(input.StockLeft, 0);
        existing.Rating = Math.Clamp(input.Rating, 0, 5);
        existing.Reviews = Math.Max(input.Reviews, 0);
        existing.Brand = input.Brand.Trim();
        existing.Color = input.Color.Trim();
        existing.Material = input.Material.Trim();
        existing.Style = input.Style.Trim();
        existing.InStock = input.StockLeft > 0;
        existing.IsActive = input.IsActive;

        var saved = repository.Update(existing);
        if (saved is null)
        {
            return null;
        }

        return MapProduct(repository.GetById(saved.ProductId) ?? saved);
    }

    public bool Delete(int id) => repository.Delete(id);

    public IReadOnlyCollection<ProductReviewView> GetReviews(int productId)
    {
        return reviewRepository.GetByProductId(productId)
            .Select(r => new ProductReviewView
            {
                Id = r.Id,
                ProductId = r.ProductId,
                Author = r.Author,
                Rating = r.Rating,
                Comment = r.Comment,
                CreatedAt = r.CreatedAt
            })
            .ToList();
    }

    public ProductReviewView AddReview(ProductReviewCreateInput input)
    {
        var product = repository.GetById(input.ProductId);
        if (product is null)
        {
            throw new Exception("Product does not exist.");
        }

        var review = new ProductReview
        {
            ProductId = input.ProductId,
            Author = input.Author,
            Rating = Math.Clamp(input.Rating, 1, 5),
            Comment = input.Comment,
            CreatedAt = DateTime.UtcNow
        };

        var created = reviewRepository.Create(review);

        // Update product average rating
        var allReviews = reviewRepository.GetByProductId(input.ProductId);
        product.Rating = allReviews.Average(r => r.Rating);
        product.Reviews = allReviews.Count;
        repository.Update(product);

        return new ProductReviewView
        {
            Id = created.Id,
            ProductId = created.ProductId,
            Author = created.Author,
            Rating = created.Rating,
            Comment = created.Comment,
            CreatedAt = created.CreatedAt
        };
    }

    private static IEnumerable<Product> ApplySorting(
        IEnumerable<Product> query,
        string normalizedSort,
        string normalizedQuery)
    {
        return normalizedSort switch
        {
            "price-asc" or "price_asc" => query.OrderBy(product => product.Price).ThenByDescending(product => product.ProductId),
            "price-desc" or "price_desc" => query.OrderByDescending(product => product.Price).ThenByDescending(product => product.ProductId),
            "rating-desc" or "best_selling" => query
                .OrderByDescending(product => product.Rating)
                .ThenByDescending(product => product.Reviews)
                .ThenByDescending(product => product.ProductId),
            "newest" => query.OrderByDescending(product => product.CreatedAt).ThenByDescending(product => product.ProductId),
            _ => string.IsNullOrWhiteSpace(normalizedQuery)
                ? query.OrderByDescending(product => product.CreatedAt).ThenByDescending(product => product.ProductId)
                : query
                    .OrderByDescending(product => GetRelevanceScore(product, normalizedQuery))
                    .ThenByDescending(product => product.Rating)
                    .ThenByDescending(product => product.Reviews)
                    .ThenByDescending(product => product.ProductId)
        };
    }

    private static bool MatchesSearch(Product product, string query)
    {
        var terms = new[]
        {
            product.ProductName,
            product.Sku,
            GetCategoryName(product),
            product.Brand,
            product.Style,
            product.Material,
            product.Color
        };

        return terms.Any(term => Normalize(term).Contains(query, StringComparison.Ordinal));
    }

    private static bool MatchesCategory(Product product, IReadOnlyCollection<string> categories)
    {
        var categoryName = Normalize(GetCategoryName(product));
        var categorySlug = Normalize(GetCategorySlug(product));

        return categories.Contains(categoryName) || categories.Contains(categorySlug);
    }

    private static bool IsInStock(Product product) =>
        product.InStock || product.StockLeft > 0;

    private static bool IsOnSale(Product product) =>
        product.OldPrice is not null && product.OldPrice > product.Price;

    private static int GetRelevanceScore(Product product, string query)
    {
        var score = 0;
        var name = Normalize(product.ProductName);
        var sku = Normalize(product.Sku);
        var category = Normalize(GetCategoryName(product));
        var brand = Normalize(product.Brand);
        var style = Normalize(product.Style);
        var material = Normalize(product.Material);
        var color = Normalize(product.Color);

        if (name == query) score += 100;
        if (name.StartsWith(query, StringComparison.Ordinal)) score += 40;
        if (name.Contains(query, StringComparison.Ordinal)) score += 30;
        if (sku.Contains(query, StringComparison.Ordinal)) score += 25;
        if (category.Contains(query, StringComparison.Ordinal)) score += 18;
        if (brand.Contains(query, StringComparison.Ordinal)) score += 15;
        if (style.Contains(query, StringComparison.Ordinal)) score += 12;
        if (material.Contains(query, StringComparison.Ordinal)) score += 10;
        if (color.Contains(query, StringComparison.Ordinal)) score += 8;

        score += (int)Math.Round(product.Rating * 2, MidpointRounding.AwayFromZero);
        score += Math.Min(product.Reviews / 50, 8);

        if (IsInStock(product)) score += 6;
        if (IsOnSale(product)) score += 4;

        return score;
    }

    private static string Normalize(string? value) =>
        (value ?? string.Empty).Trim().ToLowerInvariant();

    private static string NormalizeSku(string? value) =>
        (value ?? string.Empty).Trim().ToUpperInvariant();

    private static string NormalizeSlug(string? value) =>
        (value ?? string.Empty).Trim().ToLowerInvariant();

    private static string? NormalizeOptional(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private static string GetCategoryName(Product product) =>
        product.CategoryNavigation?.Name ?? product.Category;

    private static string GetCategorySlug(Product product) =>
        product.CategoryNavigation?.Slug ?? string.Empty;

    private void ValidatePricing(decimal price, decimal? originalPrice)
    {
        if (originalPrice is null || originalPrice.Value >= price)
        {
            return;
        }

        throw new RequestValidationException(
            "Original price must be greater than or equal to the current price.",
            new Dictionary<string, string[]>
            {
                ["originalPrice"] = ["Original price must be greater than or equal to price."]
            },
            AppErrorCodes.ProductOriginalPriceInvalid);
    }

    private Category RequireActiveCategory(int categoryId)
    {
        var category = categoryRepository.GetById(categoryId);
        if (category is null)
        {
            throw new RequestValidationException(
                "Category is invalid.",
                new Dictionary<string, string[]>
                {
                    ["categoryId"] = ["Selected category does not exist."]
                },
                AppErrorCodes.CategoryInvalid);
        }

        if (!category.IsActive)
        {
            throw new ConflictException("Selected category is inactive and cannot be assigned to a product.", AppErrorCodes.CategoryInactive);
        }

        return category;
    }

    private void EnsureUniqueSku(string sku, int? excludedProductId)
    {
        var existing = repository.GetBySku(sku);
        if (existing is not null && existing.ProductId != excludedProductId)
        {
            throw new ConflictException("Product SKU is already in use.", AppErrorCodes.ProductSkuAlreadyExists);
        }
    }

    private void EnsureUniqueSlug(string slug, int? excludedProductId)
    {
        var existing = repository.GetBySlug(slug);
        if (existing is not null && existing.ProductId != excludedProductId)
        {
            throw new ConflictException("Product slug is already in use.", AppErrorCodes.ProductSlugAlreadyExists);
        }
    }

    private static List<string> ParseList(string? raw)
    {
        if (string.IsNullOrWhiteSpace(raw))
        {
            return [];
        }

        return raw
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Select(Normalize)
            .Where(value => !string.IsNullOrWhiteSpace(value))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();
    }

    private static ProductView MapProduct(Product product) =>
        new(
            product.ProductId,
            product.Sku,
            product.ProductName,
            product.Slug,
            product.Price,
            product.OldPrice,
            product.CategoryId,
            GetCategoryName(product),
            product.Image,
            product.HoverImage,
            product.VideoUrl,
            product.Tag,
            product.SoldPercentage,
            product.StockLeft,
            product.Rating,
            product.Reviews,
            product.Brand,
            product.Color,
            product.Material,
            product.Style,
            product.InStock,
            product.IsActive,
            product.CreatedAt,
            product.Description,
            product.CategoryNavigation is null
                ? null
                : new ProductCategoryView(
                    product.CategoryNavigation.Id,
                    product.CategoryNavigation.Name,
                    product.CategoryNavigation.Slug,
                    product.CategoryNavigation.IsActive));
}
