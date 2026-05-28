namespace HomeDecorShop.Application;

public interface IWalletService
{
    WalletView GetOrCreate(string token);
    WalletView Deposit(string token, decimal amount);
    string CreatePendingDeposit(string token, decimal amount, string txnRef);
    void ConfirmDeposit(string txnRef, decimal amount);
    WalletView Withdraw(string token, decimal amount);
    WalletView PayOrder(string token, int orderId);
    IReadOnlyCollection<WalletTransactionView> GetTransactions(string token);
    void AddToAdminWallet(decimal amount, string reference, string description);
    void ProcessRefundPayment(int customerId, decimal amount, string orderNumber);
}
