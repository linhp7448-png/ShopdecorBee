namespace HomeDecorShop.Domain;

public class SystemSetting
{
    public int Id { get; set; }
    public string StoreName { get; set; } = "HomeDecorShop";
    public decimal VatPercentage { get; set; } = 10;
    public decimal DefaultShippingFee { get; set; } = 30000;
    public string? ContactEmail { get; set; }
    public string? ContactPhone { get; set; }
    public string? Address { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
