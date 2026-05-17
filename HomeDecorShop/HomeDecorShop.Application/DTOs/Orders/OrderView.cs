namespace HomeDecorShop.Application;

public sealed record OrderView(
    int Id,
    string OrderNumber,
    string Status,
    string PaymentStatus,
    decimal Subtotal,
    decimal ShippingFee,
    decimal TotalAmount,
    string FullName,
    string Phone,
    string Line1,
    string Ward,
    string District,
    string City,
    string? Notes,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    IReadOnlyCollection<OrderItemView> Items);
