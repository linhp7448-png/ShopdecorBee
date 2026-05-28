namespace HomeDecorShop.Domain;

public class WalletTransaction
{
    public int Id { get; set; }
    public int WalletId { get; set; }
    public decimal Amount { get; set; }
    public WalletTransactionType Type { get; set; }
    public WalletTransactionStatus Status { get; set; }
    public string? Reference { get; set; } // OrderNumber or VNPay Transaction Code
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }

    public Wallet Wallet { get; set; } = null!;
}
