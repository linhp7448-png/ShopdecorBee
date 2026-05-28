using HomeDecorShop.Application;
using HomeDecorShop.Domain;
using Microsoft.EntityFrameworkCore;

namespace HomeDecorShop.Infrastructure;

public sealed class SqlWalletRepository(AppDbContext db) : IWalletRepository
{
    public Wallet? GetByUserId(int userId) =>
        db.Wallets.FirstOrDefault(w => w.UserId == userId);

    public Wallet? GetById(int walletId) =>
        db.Wallets.FirstOrDefault(w => w.Id == walletId);

    public Wallet Create(Wallet wallet)
    {
        db.Wallets.Add(wallet);
        db.SaveChanges();
        return wallet;
    }

    public Wallet Update(Wallet wallet)
    {
        db.Wallets.Update(wallet);
        db.SaveChanges();
        return wallet;
    }

    public WalletTransaction? GetTransactionById(int transactionId) =>
        db.WalletTransactions.FirstOrDefault(t => t.Id == transactionId);

    public WalletTransaction? GetTransactionByReference(string reference) =>
        db.WalletTransactions.FirstOrDefault(t => t.Reference == reference);

    public WalletTransaction CreateTransaction(WalletTransaction transaction)
    {
        db.WalletTransactions.Add(transaction);
        db.SaveChanges();
        return transaction;
    }

    public WalletTransaction UpdateTransaction(WalletTransaction transaction)
    {
        db.WalletTransactions.Update(transaction);
        db.SaveChanges();
        return transaction;
    }

    public IReadOnlyCollection<WalletTransaction> GetTransactionsByWalletId(int walletId) =>
        db.WalletTransactions
            .Where(t => t.WalletId == walletId)
            .OrderByDescending(t => t.CreatedAt)
            .ToArray();
}
