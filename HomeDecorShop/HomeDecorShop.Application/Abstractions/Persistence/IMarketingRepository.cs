using HomeDecorShop.Domain;

namespace HomeDecorShop.Application;

public interface IMarketingRepository
{
    // Coupons
    Task<IReadOnlyCollection<Coupon>> GetCouponsAsync();
    Task<Coupon?> GetCouponByCodeAsync(string code);
    Task<Coupon?> GetCouponByIdAsync(int id);
    Task<Coupon> CreateCouponAsync(Coupon coupon);
    Task DeleteCouponAsync(Coupon coupon);

    // Banners
    Task<IReadOnlyCollection<Banner>> GetBannersAsync();
    Task<Banner?> GetBannerByIdAsync(int id);
    Task<Banner> UpsertBannerAsync(Banner banner);
    Task DeleteBannerAsync(Banner banner);

    // Blog Posts
    Task<IReadOnlyCollection<BlogPost>> GetBlogPostsAsync();
    Task<BlogPost?> GetBlogByIdAsync(int id);
    Task<BlogPost> CreateBlogPostAsync(BlogPost post);
    Task DeleteBlogPostAsync(BlogPost post);

    Task SaveChangesAsync();
}
