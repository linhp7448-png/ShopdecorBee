namespace HomeDecorShop.Application;

public sealed record OrderItemView(
    int Id,
    int? ProductId,
    string ProductName,
    string ProductSku,
    string ProductImage,
    decimal UnitPrice,
    int Quantity,
    decimal LineTotal);
