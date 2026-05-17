namespace HomeDecorShop.API.Payments;

public sealed class VnPayOptions
{
    public const string SectionName = "VnPay";

    public string TmnCode { get; init; } = string.Empty;

    public string HashSecret { get; init; } = string.Empty;

    public string PaymentUrl { get; init; } = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";

    public string ReturnUrl { get; init; } = string.Empty;

    public string WalletDepositReturnUrl { get; init; } = string.Empty;

    public string? FrontendReturnUrl { get; init; }

    public string? FrontendWalletReturnUrl { get; init; }

    public string Locale { get; init; } = "vn";

    public string OrderType { get; init; } = "other";
}
