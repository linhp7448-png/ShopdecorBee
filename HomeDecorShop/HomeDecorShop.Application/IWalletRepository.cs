using HomeDecorShop.Domain;

namespace HomeDecorShop.Application;

public interface IWalletRepository
{
    Wallet? GetByUserId(int userId);
    Wallet? GetById(int walletId);
    Wallet Create(Wallet wallet);
    Wallet Update(Wallet wallet);
    
    WalletTransaction? GetTransactionById(int transactionId);
    WalletTransaction? GetTransactionByReference(string reference);
    WalletTransaction CreateTransaction(WalletTransaction transaction);
    WalletTransaction UpdateTransaction(WalletTransaction transaction);
    IReadOnlyCollection<WalletTransaction> GetTransactionsByWalletId(int walletId);
}
