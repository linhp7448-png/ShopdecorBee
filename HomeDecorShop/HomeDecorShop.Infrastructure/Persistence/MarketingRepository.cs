using HomeDecorShop.Application;
using HomeDecorShop.Domain;
using Microsoft.EntityFrameworkCore;

namespace HomeDecorShop.Infrastructure;

public class MarketingRepository(AppDbContext db) : IMarketingRepository
{
    // Coupons
    public async Task<IReadOnlyCollection<Coupon>> GetCouponsAsync() =>
        await db.Coupons.OrderByDescending(c => c.CreatedAt).ToListAsync();

    public async Task<Coupon?> GetCouponByCodeAsync(string code) =>
        await db.Coupons.FirstOrDefaultAsync(c => c.Code == code.ToUpper());

    public async Task<Coupon?> GetCouponByIdAsync(int id) =>
        await db.Coupons.FindAsync(id);

    public async Task<Coupon> CreateCouponAsync(Coupon coupon)
    {
        db.Coupons.Add(coupon);
        await db.SaveChangesAsync();
        return coupon;
    }

    public async Task DeleteCouponAsync(Coupon coupon)
    {
        db.Coupons.Remove(coupon);
        await db.SaveChangesAsync();
    }

    // Banners
    public async Task<IReadOnlyCollection<Banner>> GetBannersAsync() =>
        await db.Banners.OrderBy(b => b.Position).ToListAsync();

    public async Task<Banner?> GetBannerByIdAsync(int id) =>
        await db.Banners.FindAsync(id);

    public async Task<Banner> UpsertBannerAsync(Banner banner)
    {
        if (banner.Id == 0) db.Banners.Add(banner);
        else db.Banners.Update(banner);
        await db.SaveChangesAsync();
        return banner;
    }

    public async Task DeleteBannerAsync(Banner banner)
    {
        db.Banners.Remove(banner);
        await db.SaveChangesAsync();
    }

    // Blog Posts
    public async Task<IReadOnlyCollection<BlogPost>> GetBlogPostsAsync() =>
        await db.BlogPosts.OrderByDescending(b => b.CreatedAt).ToListAsync();

    public async Task<BlogPost?> GetBlogByIdAsync(int id) =>
        await db.BlogPosts.FindAsync(id);

    public async Task<BlogPost> CreateBlogPostAsync(BlogPost post)
    {
        db.BlogPosts.Add(post);
        await db.SaveChangesAsync();
        return post;
    }

    public async Task DeleteBlogPostAsync(BlogPost post)
    {
        db.BlogPosts.Remove(post);
        await db.SaveChangesAsync();
    }

    public async Task SaveChangesAsync() => await db.SaveChangesAsync();
}
