namespace HomeDecorShop.Domain;

public class Coupon
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public int DiscountPercentage { get; set; }
    public DateTime ExpiryDate { get; set; }
    public int MaxUsage { get; set; }
    public int CurrentUsage { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
