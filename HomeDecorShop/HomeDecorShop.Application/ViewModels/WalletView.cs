namespace HomeDecorShop.Application;

public sealed record WalletView(
    int Id,
    int UserId,
    decimal Balance,
    DateTime UpdatedAt);

public sealed record WalletTransactionView(
    int Id,
    int WalletId,
    decimal Amount,
    string Type,
    string Status,
    string? Reference,
    string? Description,
    DateTime CreatedAt);
