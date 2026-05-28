using HomeDecorShop.Application.DTOs.Marketing;
using HomeDecorShop.Domain;

namespace HomeDecorShop.Application;

public class MarketingService(IMarketingRepository repository) : IMarketingService
{
    // ============ COUPONS ============

    public async Task<CouponView[]> GetCouponsAsync()
    {
        var coupons = await repository.GetCouponsAsync();
        return coupons.Select(MapCoupon).ToArray();
    }

    public async Task<CouponView> CreateCouponAsync(CreateCouponInput input)
    {
        var coupon = new Coupon
        {
            Code = input.Code.ToUpper().Trim(),
            DiscountPercentage = input.DiscountPercentage,
            ExpiryDate = input.ExpiryDate,
            MaxUsage = input.MaxUsage,
            CurrentUsage = 0,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };
        await repository.CreateCouponAsync(coupon);
        return MapCoupon(coupon);
    }

    public async Task DeleteCouponAsync(int id)
    {
        var coupon = await repository.GetCouponByIdAsync(id)
            ?? throw new KeyNotFoundException($"Coupon {id} not found.");
        await repository.DeleteCouponAsync(coupon);
    }

    public async Task<CouponView?> ValidateCouponAsync(string code)
    {
        var coupon = await repository.GetCouponByCodeAsync(code.ToUpper());
        if (coupon is null || !coupon.IsActive || coupon.ExpiryDate < DateTime.UtcNow || coupon.CurrentUsage >= coupon.MaxUsage)
        {
           return null;
        }
        return MapCoupon(coupon);
    }

    // ============ BANNERS ============

    public async Task<BannerView[]> GetBannersAsync()
    {
        var banners = await repository.GetBannersAsync();
        return banners.Select(MapBanner).ToArray();
    }

    public async Task<BannerView> UpsertBannerAsync(int? id, UpdateBannerInput input)
    {
        Banner banner;
        if (id.HasValue)
        {
            banner = await repository.GetBannerByIdAsync(id.Value)
                ?? throw new KeyNotFoundException($"Banner {id} not found.");
            banner.Title = input.Title;
            banner.ImageUrl = input.ImageUrl;
            banner.Link = input.Link;
            banner.Position = input.Position;
            banner.IsActive = input.IsActive;
        }
        else
        {
            banner = new Banner
            {
                Title = input.Title,
                ImageUrl = input.ImageUrl,
                Link = input.Link,
                Position = input.Position,
                IsActive = input.IsActive
            };
        }
        await repository.UpsertBannerAsync(banner);
        return MapBanner(banner);
    }

    public async Task DeleteBannerAsync(int id)
    {
        var banner = await repository.GetBannerByIdAsync(id)
            ?? throw new KeyNotFoundException($"Banner {id} not found.");
        await repository.DeleteBannerAsync(banner);
    }

    // ============ BLOG POSTS ============

    public async Task<BlogPostView[]> GetBlogPostsAsync()
    {
        var posts = await repository.GetBlogPostsAsync();
        return posts.Select(MapBlogPost).ToArray();
    }

    public async Task<BlogPostView> CreateBlogPostAsync(CreateBlogPostInput input)
    {
        var post = new BlogPost
        {
            Title = input.Title,
            Slug = input.Slug,
            Content = input.Content,
            Author = input.Author,
            ImageUrl = input.ImageUrl,
            Views = 0,
            CreatedAt = DateTime.UtcNow
        };
        await repository.CreateBlogPostAsync(post);
        return MapBlogPost(post);
    }

    public async Task DeleteBlogPostAsync(int id)
    {
        var post = await repository.GetBlogByIdAsync(id)
            ?? throw new KeyNotFoundException($"BlogPost {id} not found.");
        await repository.DeleteBlogPostAsync(post);
    }

    // ============ MAPPERS ============

    private static CouponView MapCoupon(Coupon c) => new(
        c.Id, c.Code, c.DiscountPercentage, c.ExpiryDate,
        c.MaxUsage, c.CurrentUsage, c.IsActive, c.CreatedAt);

    private static BannerView MapBanner(Banner b) => new(
        b.Id, b.Title, b.ImageUrl, b.Link, b.Position, b.IsActive);

    private static BlogPostView MapBlogPost(BlogPost b) => new(
        b.Id, b.Title, b.Slug, b.Content, b.Author,
        b.ImageUrl, b.Views, b.CreatedAt);
}
