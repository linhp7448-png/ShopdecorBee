namespace HomeDecorShop.Application;

public sealed record CartItemView(
    int Id,
    int ProductId,
    string ProductName,
    string ProductSku,
    string ProductImage,
    decimal UnitPrice,
    int Quantity,
    decimal LineTotal,
    int AvailableStock,
    bool IsAvailable);
