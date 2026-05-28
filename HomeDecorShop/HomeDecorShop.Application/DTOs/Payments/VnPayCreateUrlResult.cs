namespace HomeDecorShop.Application;

public sealed record VnPayCreateUrlResult(
    int PaymentId,
    int OrderId,
    string OrderNumber,
    decimal Amount,
    string TransactionCode,
    DateTime CreatedAt);
