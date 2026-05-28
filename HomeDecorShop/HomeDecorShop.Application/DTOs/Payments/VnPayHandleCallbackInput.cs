namespace HomeDecorShop.Application;

public sealed class VnPayHandleCallbackInput
{
    public required string TransactionCode { get; init; }

    public required string ResponseCode { get; init; }

    public required long Amount { get; init; }

    public string? TransactionStatus { get; init; }

    public string? GatewayTransactionCode { get; init; }
}