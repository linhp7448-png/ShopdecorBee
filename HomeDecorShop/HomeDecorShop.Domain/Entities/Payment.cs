namespace HomeDecorShop.Domain;

public class Payment
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public string Method { get; set; } = string.Empty;
    public PaymentStatus Status { get; set; }
    public decimal Amount { get; set; }
    public string TransactionCode { get; set; } = string.Empty;
    public DateTime? PaidAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public Order Order { get; set; } = null!;
}
