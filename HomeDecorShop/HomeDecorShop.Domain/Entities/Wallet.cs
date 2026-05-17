namespace HomeDecorShop.Domain;

public class Wallet
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public decimal Balance { get; set; }
    public DateTime UpdatedAt { get; set; }

    public User User { get; set; } = null!;
    public ICollection<WalletTransaction> Transactions { get; set; } = new List<WalletTransaction>();
}
