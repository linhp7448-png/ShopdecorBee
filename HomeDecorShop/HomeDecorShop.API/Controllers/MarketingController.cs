using HomeDecorShop.Application;
using HomeDecorShop.Application.DTOs.Marketing;
using Microsoft.AspNetCore.Mvc;

namespace HomeDecorShop.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class MarketingController(IMarketingService marketingService) : ApiControllerBase
{
    // ============ COUPONS ============

    [HttpGet("coupons")]
    public async Task<ActionResult<CouponView[]>> GetCoupons()
    {
        return Ok(await marketingService.GetCouponsAsync());
    }

    [HttpPost("coupons")]
    public async Task<ActionResult<CouponView>> CreateCoupon(CreateCouponInput input)
    {
        var coupon = await marketingService.CreateCouponAsync(input);
        return CreatedAtAction(nameof(GetCoupons), new { id = coupon.Id }, coupon);
    }

    [HttpDelete("coupons/{id}")]
    public async Task<IActionResult> DeleteCoupon(int id)
    {
        await marketingService.DeleteCouponAsync(id);
        return NoContent();
    }

    [HttpGet("coupons/validate/{code}")]
    public async Task<ActionResult<CouponView>> ValidateCoupon(string code)
    {
        var coupon = await marketingService.ValidateCouponAsync(code);
        return coupon is null ? NotFound("Mã giảm giá không hợp lệ hoặc đã hết hạn.") : Ok(coupon);
    }

    // ============ BANNERS ============

    [HttpGet("banners")]
    public async Task<ActionResult<BannerView[]>> GetBanners()
    {
        return Ok(await marketingService.GetBannersAsync());
    }

    [HttpPut("banners/{id?}")]
    public async Task<ActionResult<BannerView>> UpsertBanner(int? id, UpdateBannerInput input)
    {
        var banner = await marketingService.UpsertBannerAsync(id, input);
        return Ok(banner);
    }

    [HttpDelete("banners/{id}")]
    public async Task<IActionResult> DeleteBanner(int id)
    {
        await marketingService.DeleteBannerAsync(id);
        return NoContent();
    }

    // ============ BLOG POSTS ============

    [HttpGet("blogs")]
    public async Task<ActionResult<BlogPostView[]>> GetBlogPosts()
    {
        return Ok(await marketingService.GetBlogPostsAsync());
    }

    [HttpPost("blogs")]
    public async Task<ActionResult<BlogPostView>> CreateBlogPost(CreateBlogPostInput input)
    {
        var post = await marketingService.CreateBlogPostAsync(input);
        return CreatedAtAction(nameof(GetBlogPosts), new { id = post.Id }, post);
    }

    [HttpDelete("blogs/{id}")]
    public async Task<IActionResult> DeleteBlogPost(int id)
    {
        await marketingService.DeleteBlogPostAsync(id);
        return NoContent();
    }
}
