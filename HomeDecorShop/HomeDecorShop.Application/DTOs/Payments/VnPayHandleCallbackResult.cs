namespace HomeDecorShop.Application;

public sealed record VnPayHandleCallbackResult(
    int PaymentId,
    int OrderId,
    string OrderNumber,
    string PaymentStatus,
    string OrderStatus,
    string ResponseCode,
    string? TransactionStatus,
    string TransactionCode,
    string? GatewayTransactionCode,
    bool IsSuccess,
    string Message);
