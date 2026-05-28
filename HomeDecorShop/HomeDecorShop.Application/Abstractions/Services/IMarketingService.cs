using HomeDecorShop.Application.DTOs.Marketing;
using System.Threading.Tasks;

namespace HomeDecorShop.Application;

public interface IMarketingService
{
    // Coupons
    Task<CouponView[]> GetCouponsAsync();
    Task<CouponView> CreateCouponAsync(CreateCouponInput input);
    Task DeleteCouponAsync(int id);
    Task<CouponView?> ValidateCouponAsync(string code);

    // Banners
    Task<BannerView[]> GetBannersAsync();
    Task<BannerView> UpsertBannerAsync(int? id, UpdateBannerInput input);
    Task DeleteBannerAsync(int id);

    // Blog Posts
    Task<BlogPostView[]> GetBlogPostsAsync();
    Task<BlogPostView> CreateBlogPostAsync(CreateBlogPostInput input);
    Task DeleteBlogPostAsync(int id);
}
