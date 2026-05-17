using System.Transactions;
using HomeDecorShop.Domain;

namespace HomeDecorShop.Application;

public sealed class WalletService(
    IWalletRepository walletRepository,
    IOrderRepository orderRepository,
    IPaymentRepository paymentRepository,
    IUserRepository userRepository) : IWalletService
{
    public WalletView GetOrCreate(string token)
    {
        var user = RequireUser(token);
        var wallet = walletRepository.GetByUserId(user.UserId) ?? CreateWallet(user.UserId);
        return MapWallet(wallet);
    }

    public WalletView Deposit(string token, decimal amount)
    {
        if (amount <= 0)
        {
            throw new RequestValidationException(
                "Deposit amount must be greater than zero.",
                new Dictionary<string, string[]>(StringComparer.OrdinalIgnoreCase)
                {
                    ["amount"] = ["So tien nap phai lon hon 0."]
                },
                AppErrorCodes.RequestValidationFailed);
        }

        var user = RequireUser(token);
        var wallet = walletRepository.GetByUserId(user.UserId) ?? CreateWallet(user.UserId);
        var now = DateTime.UtcNow;

        using var scope = new TransactionScope(TransactionScopeOption.Required, TransactionScopeAsyncFlowOption.Enabled);

        wallet.Balance += amount;
        wallet.UpdatedAt = now;
        wallet = walletRepository.Update(wallet);

        walletRepository.CreateTransaction(new WalletTransaction
        {
            WalletId = wallet.Id,
            Amount = amount,
            Type = WalletTransactionType.Deposit,
            Status = WalletTransactionStatus.Success,
            Reference = $"DEPOSIT-{now:yyyyMMddHHmmssfff}",
            Description = $"Nap {amount:N0} VND vao vi",
            CreatedAt = now
        });

        scope.Complete();
        return MapWallet(wallet);
    }

    public string CreatePendingDeposit(string token, decimal amount, string txnRef)
    {
        var user = RequireUser(token);
        var wallet = walletRepository.GetByUserId(user.UserId) ?? CreateWallet(user.UserId);
        var now = DateTime.UtcNow;

        walletRepository.CreateTransaction(new WalletTransaction
        {
            WalletId = wallet.Id,
            Amount = amount,
            Type = WalletTransactionType.Deposit,
            Status = WalletTransactionStatus.Pending,
            Reference = txnRef,
            Description = $"Nap {amount:N0} VND vao vi qua VNPay (cho thanh toan)",
            CreatedAt = now
        });

        return txnRef;
    }

    public void ConfirmDeposit(string txnRef, decimal amount)
    {
        var tx = walletRepository.GetTransactionByReference(txnRef)
            ?? throw new NotFoundException($"Wallet transaction '{txnRef}' not found.", AppErrorCodes.PaymentNotFound);

        if (tx.Status == WalletTransactionStatus.Success)
            return; // already confirmed, idempotent

        var wallet = walletRepository.GetById(tx.WalletId)
            ?? throw new NotFoundException($"Wallet {tx.WalletId} not found.", AppErrorCodes.PaymentNotFound);

        var now = DateTime.UtcNow;

        using var scope = new TransactionScope(TransactionScopeOption.Required, TransactionScopeAsyncFlowOption.Enabled);

        wallet.Balance += tx.Amount;
        wallet.UpdatedAt = now;
        walletRepository.Update(wallet);

        tx.Status = WalletTransactionStatus.Success;
        tx.Description = $"Nap {tx.Amount:N0} VND vao vi thanh cong qua VNPay";
        walletRepository.UpdateTransaction(tx);

        scope.Complete();
    }


    public WalletView Withdraw(string token, decimal amount)
    {
        if (amount <= 0)
        {
            throw new RequestValidationException(
                "Withdraw amount must be greater than zero.",
                new Dictionary<string, string[]>(StringComparer.OrdinalIgnoreCase)
                {
                    ["amount"] = ["So tien rut phai lon hon 0."]
                },
                AppErrorCodes.RequestValidationFailed);
        }

        var user = RequireUser(token);
        var wallet = walletRepository.GetByUserId(user.UserId) ?? CreateWallet(user.UserId);

        if (wallet.Balance < amount)
        {
            throw new ConflictException(
                "Insufficient wallet balance.",
                AppErrorCodes.WalletInsufficientBalance);
        }

        var now = DateTime.UtcNow;

        using var scope = new TransactionScope(TransactionScopeOption.Required, TransactionScopeAsyncFlowOption.Enabled);

        wallet.Balance -= amount;
        wallet.UpdatedAt = now;
        wallet = walletRepository.Update(wallet);

        walletRepository.CreateTransaction(new WalletTransaction
        {
            WalletId = wallet.Id,
            Amount = amount,
            Type = WalletTransactionType.Withdraw,
            Status = WalletTransactionStatus.Success,
            Reference = $"WITHDRAW-{now:yyyyMMddHHmmssfff}",
            Description = $"Rut {amount:N0} VND tu vi",
            CreatedAt = now
        });

        scope.Complete();
        return MapWallet(wallet);
    }

    public WalletView PayOrder(string token, int orderId)
    {
        var user = RequireUser(token);

        var order = orderRepository.GetById(orderId);
        if (order is null || order.UserId != user.UserId)
        {
            throw new NotFoundException($"Order with id {orderId} was not found.", AppErrorCodes.OrderNotFound);
        }

        if (order.Status == OrderStatus.Cancelled)
        {
            throw new ConflictException("Cancelled orders cannot be paid.", AppErrorCodes.OrderCancelled);
        }

        if (order.PaymentStatus == PaymentStatus.Paid)
        {
            throw new ConflictException("This order has already been paid.", AppErrorCodes.OrderAlreadyPaid);
        }

        if (order.Status != OrderStatus.PendingPayment)
        {
            throw new ConflictException("Only orders waiting for payment can be processed.", AppErrorCodes.OrderPaymentNotPending);
        }

        var wallet = walletRepository.GetByUserId(user.UserId) ?? CreateWallet(user.UserId);

        if (wallet.Balance < order.TotalAmount)
        {
            throw new ConflictException(
                $"Insufficient wallet balance. Required: {order.TotalAmount:N0} VND, Available: {wallet.Balance:N0} VND.",
                AppErrorCodes.WalletInsufficientBalance);
        }

        var now = DateTime.UtcNow;

        using var scope = new TransactionScope(TransactionScopeOption.Required, TransactionScopeAsyncFlowOption.Enabled);

        wallet.Balance -= order.TotalAmount;
        wallet.UpdatedAt = now;
        wallet = walletRepository.Update(wallet);

        walletRepository.CreateTransaction(new WalletTransaction
        {
            WalletId = wallet.Id,
            Amount = order.TotalAmount,
            Type = WalletTransactionType.Payment,
            Status = WalletTransactionStatus.Success,
            Reference = order.OrderNumber,
            Description = $"Thanh toan don hang {order.OrderNumber}",
            CreatedAt = now
        });

        var payment = new Payment
        {
            OrderId = order.Id,
            Method = "wallet",
            Status = PaymentStatus.Paid,
            Amount = order.TotalAmount,
            TransactionCode = $"WALLET-{now:yyyyMMddHHmmssfff}-{order.Id}",
            PaidAt = now,
            CreatedAt = now,
            UpdatedAt = now
        };
        paymentRepository.Create(payment);

        order.PaymentStatus = PaymentStatus.Paid;
        order.Status = OrderStatus.Processing;
        order.UpdatedAt = now;
        orderRepository.Update(order);

        // Add money to Admin's wallet
        AddToAdminWalletInternal(order.TotalAmount, $"REVENUE-{order.OrderNumber}", $"Doanh thu từ đơn hàng {order.OrderNumber}");

        scope.Complete();
        return MapWallet(wallet);
    }

    public IReadOnlyCollection<WalletTransactionView> GetTransactions(string token)
    {
        var user = RequireUser(token);
        var wallet = walletRepository.GetByUserId(user.UserId);
        if (wallet is null)
        {
            return [];
        }

        return walletRepository.GetTransactionsByWalletId(wallet.Id)
            .Select(MapTransaction)
            .ToArray();
    }

    public void AddToAdminWallet(decimal amount, string reference, string description)
    {
        using var scope = new TransactionScope(TransactionScopeOption.Required, TransactionScopeAsyncFlowOption.Enabled);
        AddToAdminWalletInternal(amount, reference, description);
        scope.Complete();
    }

    private void AddToAdminWalletInternal(decimal amount, string reference, string description)
    {
        var admin = userRepository.GetAdmins().FirstOrDefault();
        if (admin is null) return;

        var adminWallet = walletRepository.GetByUserId(admin.UserId) ?? CreateWallet(admin.UserId);
        var now = DateTime.UtcNow;

        adminWallet.Balance += amount;
        adminWallet.UpdatedAt = now;
        walletRepository.Update(adminWallet);

        walletRepository.CreateTransaction(new WalletTransaction
        {
            WalletId = adminWallet.Id,
            Amount = amount,
            Type = WalletTransactionType.Deposit,
            Status = WalletTransactionStatus.Success,
            Reference = reference,
            Description = description,
            CreatedAt = now
        });
    }

    public void ProcessRefundPayment(int customerId, decimal amount, string orderNumber)
    {
        using var scope = new TransactionScope(TransactionScopeOption.Required, TransactionScopeAsyncFlowOption.Enabled);
        var now = DateTime.UtcNow;

        // Deduct from admin
        AddToAdminWalletInternal(-amount, $"REFUND-ORDER-{orderNumber}", $"Hoàn tiền cho khách hàng đơn {orderNumber}");

        // Add to customer
        var customerWallet = walletRepository.GetByUserId(customerId) ?? CreateWallet(customerId);
        customerWallet.Balance += amount;
        customerWallet.UpdatedAt = now;
        walletRepository.Update(customerWallet);

        walletRepository.CreateTransaction(new WalletTransaction
        {
            WalletId = customerWallet.Id,
            Amount = amount,
            Type = WalletTransactionType.Deposit,
            Status = WalletTransactionStatus.Success,
            Reference = $"REFUND-{orderNumber}",
            Description = $"Hoàn tiền khiếu nại đơn hàng {orderNumber}",
            CreatedAt = now
        });

        scope.Complete();
    }

    private Wallet CreateWallet(int userId)
    {
        return walletRepository.Create(new Wallet
        {
            UserId = userId,
            Balance = 0,
            UpdatedAt = DateTime.UtcNow
        });
    }

    private User RequireUser(string token) =>
        userRepository.GetByToken(token.Trim())
        ?? throw new UnauthorizedException("Authentication token is invalid or has expired.", AppErrorCodes.AuthTokenInvalid);

    private static WalletView MapWallet(Wallet wallet) =>
        new(wallet.Id, wallet.UserId, wallet.Balance, wallet.UpdatedAt);

    private static WalletTransactionView MapTransaction(WalletTransaction t) =>
        new(t.Id, t.WalletId, t.Amount, t.Type.ToString(), t.Status.ToString(), t.Reference, t.Description, t.CreatedAt);
}
