namespace HomeDecorShop.Application;

public sealed record PaymentView(
    int Id,
    int OrderId,
    string OrderNumber,
    string Method,
    string Status,
    decimal Amount,
    string TransactionCode,
    DateTime? PaidAt,
    DateTime CreatedAt,
    DateTime UpdatedAt);
