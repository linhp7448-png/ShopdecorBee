namespace HomeDecorShop.Application;

public sealed record CartView(
    int Id,
    int UserId,
    IReadOnlyCollection<CartItemView> Items,
    int TotalQuantity,
    decimal Subtotal,
    DateTime CreatedAt,
    DateTime UpdatedAt);
