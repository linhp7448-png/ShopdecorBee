namespace HomeDecorShop.Application.DTOs.Marketing;

public record CouponView(
    int Id,
    string Code,
    int DiscountPercentage,
    DateTime ExpiryDate,
    int MaxUsage,
    int CurrentUsage,
    bool IsActive,
    DateTime CreatedAt
);

public record CreateCouponInput(
    string Code,
    int DiscountPercentage,
    DateTime ExpiryDate,
    int MaxUsage
);

public record BannerView(
    int Id,
    string Title,
    string ImageUrl,
    string Link,
    int Position,
    bool IsActive
);

public record UpdateBannerInput(
    string Title,
    string ImageUrl,
    string Link,
    int Position,
    bool IsActive
);

public record BlogPostView(
    int Id,
    string Title,
    string Slug,
    string Content,
    string Author,
    string ImageUrl,
    int Views,
    DateTime CreatedAt
);

public record CreateBlogPostInput(
    string Title,
    string Slug,
    string Content,
    string Author,
    string ImageUrl
);
