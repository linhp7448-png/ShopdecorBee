namespace HomeDecorShop.Domain;

public class Product
{
    public int ProductId { get; set; }
    public string Sku { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal? OldPrice { get; set; }
    public int CategoryId { get; set; }
    public string Category { get; set; } = string.Empty;
    public string Image { get; set; } = string.Empty;
    public string HoverImage { get; set; } = string.Empty;
    public string? VideoUrl { get; set; }
    public string? Tag { get; set; }
    public int? SoldPercentage { get; set; }
    public int StockLeft { get; set; }
    public double Rating { get; set; }
    public int Reviews { get; set; }
    public string Brand { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public string Material { get; set; } = string.Empty;
    public string Style { get; set; } = string.Empty;
    public bool InStock { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? Description { get; set; }

    public Category CategoryNavigation { get; set; } = null!;
    public ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}
