using System;

namespace HomeDecorShop.Application;

public sealed class ProductReviewView
{
    public int Id { get; init; }
    public int ProductId { get; init; }
    public string Author { get; init; } = string.Empty;
    public double Rating { get; init; }
    public string Comment { get; init; } = string.Empty;
    public DateTime CreatedAt { get; init; }
}

public sealed class ProductReviewCreateInput
{
    public int ProductId { get; init; }
    public string Author { get; init; } = string.Empty;
    public double Rating { get; init; }
    public string Comment { get; init; } = string.Empty;
}
