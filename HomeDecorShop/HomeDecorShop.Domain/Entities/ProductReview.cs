using System;

namespace HomeDecorShop.Domain;

public class ProductReview
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string Author { get; set; } = string.Empty;
    public double Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }

    public Product Product { get; set; } = null!;
}
