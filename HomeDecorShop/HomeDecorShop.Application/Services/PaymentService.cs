using System.Transactions;
using HomeDecorShop.Domain;

namespace HomeDecorShop.Application;

public sealed class PaymentService(
    IPaymentRepository paymentRepository,
    IOrderRepository orderRepository,
    IUserRepository userRepository,
    IWalletService walletService) : IPaymentService
{
    private const int MaxVnPayTransactionCodeLength = 100;

    public IReadOnlyCollection<PaymentView> GetMine(string token)
    {
        var user = RequireUser(token);
        return paymentRepository.GetByUserId(user.UserId)
            .Select(MapPayment)
            .ToArray();
    }

    public IReadOnlyCollection<PaymentView> GetByOrderId(string token, int orderId)
    {
        var user = RequireUser(token);
        var order = orderRepository.GetById(orderId);
        if (order is null || order.UserId != user.UserId)
        {
            throw new NotFoundException($"Order with id {orderId} was not found.", AppErrorCodes.OrderNotFound);
        }

        return paymentRepository.GetByOrderId(orderId)
            .Select(MapPayment)
            .ToArray();
    }

    public PaymentView? GetById(string token, int paymentId)
    {
        var user = RequireUser(token);
        var payment = paymentRepository.GetById(paymentId);
        return payment is null || payment.Order.UserId != user.UserId
            ? null
            : MapPayment(payment);
    }

    public VnPayCreateUrlResult CreateVnPayPayment(string token, VnPayCreateUrlInput input)
    {
        var user = RequireUser(token);
        var order = orderRepository.GetById(input.OrderId);
        if (order is null || order.UserId != user.UserId)
        {
            throw new NotFoundException($"Order with id {input.OrderId} was not found.", AppErrorCodes.OrderNotFound);
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

        var existingPendingPayment = paymentRepository.GetByOrderId(order.Id)
            .Where(payment =>
                string.Equals(payment.Method, "vnpay", StringComparison.OrdinalIgnoreCase) &&
                payment.Status == PaymentStatus.Pending)
            .OrderByDescending(payment => payment.CreatedAt)
            .FirstOrDefault();

        var now = DateTime.UtcNow;

        if (existingPendingPayment is not null)
        {
            if (!IsVnPayTransactionCodeSafe(existingPendingPayment.TransactionCode))
            {
                existingPendingPayment.TransactionCode = CreateVnPayTransactionCode(order.Id, now);
                existingPendingPayment.UpdatedAt = now;
                existingPendingPayment = paymentRepository.Update(existingPendingPayment);
            }

            return new VnPayCreateUrlResult(
                existingPendingPayment.Id,
                existingPendingPayment.OrderId,
                order.OrderNumber,
                existingPendingPayment.Amount,
                existingPendingPayment.TransactionCode,
                existingPendingPayment.CreatedAt);
        }

        var payment = new Payment
        {
            OrderId = order.Id,
            Method = "vnpay",
            Status = PaymentStatus.Pending,
            Amount = order.TotalAmount,
            TransactionCode = CreateVnPayTransactionCode(order.Id, now),
            PaidAt = null,
            CreatedAt = now,
            UpdatedAt = now
        };

        var created = paymentRepository.Create(payment);
        return new VnPayCreateUrlResult(
            created.Id,
            created.OrderId,
            order.OrderNumber,
            created.Amount,
            created.TransactionCode,
            created.CreatedAt);
    }

    public VnPayHandleCallbackResult HandleVnPayCallback(VnPayHandleCallbackInput input)
    {
        var transactionCode = input.TransactionCode.Trim();
        var payment = paymentRepository.GetByTransactionCode(transactionCode)
            ?? throw new NotFoundException(
                $"Payment with transaction code '{transactionCode}' was not found.",
                AppErrorCodes.PaymentNotFound);

        if (!string.Equals(payment.Method, "vnpay", StringComparison.OrdinalIgnoreCase))
        {
            throw new ConflictException(
                "This transaction is not a VNPay payment.",
                AppErrorCodes.PaymentGatewayCallbackInvalid);
        }

        var order = orderRepository.GetById(payment.OrderId)
            ?? throw new NotFoundException(
                $"Order with id {payment.OrderId} was not found.",
                AppErrorCodes.OrderNotFound);

        var expectedAmount = ToVnPayAmount(payment.Amount);
        if (input.Amount != expectedAmount)
        {
            Console.WriteLine(
                "VNPay callback rejected amount_mismatch paymentId={0} transactionCode={1} actualAmount={2} expectedAmount={3}",
                payment.Id,
                payment.TransactionCode,
                input.Amount,
                expectedAmount);

            throw new ConflictException(
                "VNPay callback amount does not match the expected payment amount.",
                AppErrorCodes.PaymentGatewayAmountInvalid);
        }

        var now = DateTime.UtcNow;
        var callbackSuccess = IsVnPaySuccess(input);

        if (callbackSuccess)
        {
            if (order.Status == OrderStatus.Cancelled || order.PaymentStatus == PaymentStatus.Cancelled)
            {
                throw new ConflictException(
                    "Cancelled orders cannot accept VNPay confirmations.",
                    AppErrorCodes.OrderCannotBeCancelled);
            }

            var alreadyConfirmed = payment.Status == PaymentStatus.Paid && order.PaymentStatus == PaymentStatus.Paid;
            if (alreadyConfirmed)
            {
                Console.WriteLine(
                    "VNPay callback duplicate_success paymentId={0} transactionCode={1}",
                    payment.Id,
                    payment.TransactionCode);

                return MapVnPayCallback(
                    payment,
                    order,
                    input,
                    true,
                    "Payment was already confirmed previously.");
            }

            if (payment.Status != PaymentStatus.Pending ||
                order.PaymentStatus != PaymentStatus.Pending ||
                order.Status != OrderStatus.PendingPayment)
            {
                Console.WriteLine(
                    "VNPay callback rejected invalid_state paymentId={0} transactionCode={1} paymentStatus={2} orderPaymentStatus={3} orderStatus={4}",
                    payment.Id,
                    payment.TransactionCode,
                    payment.Status,
                    order.PaymentStatus,
                    order.Status);

                throw new ConflictException(
                    "The order is not in a valid state for VNPay confirmation.",
                    AppErrorCodes.OrderPaymentNotPending);
            }

            using var scope = CreateTransactionScope();

            payment.Status = PaymentStatus.Paid;
            payment.PaidAt ??= now;
            payment.UpdatedAt = now;
            _ = paymentRepository.Update(payment);

            order.PaymentStatus = PaymentStatus.Paid;
            order.Status = OrderStatus.Processing;
            order.UpdatedAt = now;
            _ = orderRepository.Update(order);

            walletService.AddToAdminWallet(order.TotalAmount, $"REVENUE-{order.OrderNumber}", $"Doanh thu từ đơn hàng {order.OrderNumber}");

            scope.Complete();

            Console.WriteLine(
                "VNPay callback confirmed paymentId={0} transactionCode={1} orderId={2}",
                payment.Id,
                payment.TransactionCode,
                order.Id);

            return MapVnPayCallback(
                payment,
                order,
                input,
                true,
                "VNPay payment confirmed.");
        }

        if (payment.Status == PaymentStatus.Pending)
        {
            payment.Status = PaymentStatus.Failed;
            payment.UpdatedAt = now;
            _ = paymentRepository.Update(payment);

            Console.WriteLine(
                "VNPay callback marked_failed paymentId={0} transactionCode={1} responseCode={2}",
                payment.Id,
                payment.TransactionCode,
                input.ResponseCode);
        }

        var alreadyPaid = payment.Status == PaymentStatus.Paid;
        return MapVnPayCallback(
            payment,
            order,
            input,
            alreadyPaid,
            alreadyPaid
                ? "Payment was already confirmed previously."
                : "VNPay reported an unsuccessful payment.");
    }

    public PaymentView Process(string token, PaymentProcessInput input)
    {
        var user = RequireUser(token);
        var order = orderRepository.GetById(input.OrderId);
        if (order is null || order.UserId != user.UserId)
        {
            throw new NotFoundException($"Order with id {input.OrderId} was not found.", AppErrorCodes.OrderNotFound);
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

        var now = DateTime.UtcNow;
        var payment = new Payment
        {
            OrderId = order.Id,
            Method = input.Method.Trim().ToLowerInvariant(),
            Status = PaymentStatus.Paid,
            Amount = order.TotalAmount,
            TransactionCode = $"PAY-{now:yyyyMMddHHmmssfff}-{order.Id}",
            PaidAt = now,
            CreatedAt = now,
            UpdatedAt = now
        };

        using var scope = CreateTransactionScope();

        var created = paymentRepository.Create(payment);
        order.PaymentStatus = PaymentStatus.Paid;
        order.Status = OrderStatus.Processing;
        order.UpdatedAt = now;
        _ = orderRepository.Update(order);

        walletService.AddToAdminWallet(order.TotalAmount, $"REVENUE-{order.OrderNumber}", $"Doanh thu từ đơn hàng {order.OrderNumber}");

        scope.Complete();
        return MapPayment(created);
    }

    private User RequireUser(string token) =>
        userRepository.GetByToken(token.Trim())
        ?? throw new UnauthorizedException("Authentication token is invalid or has expired.", AppErrorCodes.AuthTokenInvalid);

    private static PaymentView MapPayment(Payment payment) =>
        new(
            payment.Id,
            payment.OrderId,
            payment.Order.OrderNumber,
            payment.Method,
            ToSnakeCase(payment.Status),
            payment.Amount,
            payment.TransactionCode,
            payment.PaidAt,
            payment.CreatedAt,
            payment.UpdatedAt);

    private static VnPayHandleCallbackResult MapVnPayCallback(
        Payment payment,
        Order order,
        VnPayHandleCallbackInput input,
        bool isSuccess,
        string message) =>
        new(
            payment.Id,
            order.Id,
            order.OrderNumber,
            ToSnakeCase(payment.Status),
            ToSnakeCase(order.Status),
            input.ResponseCode,
            input.TransactionStatus,
            payment.TransactionCode,
            input.GatewayTransactionCode,
            isSuccess,
            message);

    private static bool IsVnPaySuccess(VnPayHandleCallbackInput input)
    {
        var responseCode = input.ResponseCode.Trim();
        var transactionStatus = input.TransactionStatus?.Trim();
        return string.Equals(responseCode, "00", StringComparison.Ordinal) &&
            (string.IsNullOrWhiteSpace(transactionStatus) || string.Equals(transactionStatus, "00", StringComparison.Ordinal));
    }

    private static long ToVnPayAmount(decimal amount) =>
        decimal.ToInt64(decimal.Round(amount * 100m, 0, MidpointRounding.AwayFromZero));

    private static string CreateVnPayTransactionCode(int orderId, DateTime timestamp)
    {
        var code = $"VNPAY{orderId}{timestamp:yyyyMMddHHmmssfff}";
        return code.Length <= MaxVnPayTransactionCodeLength
            ? code
            : code[..MaxVnPayTransactionCodeLength];
    }

    private static bool IsVnPayTransactionCodeSafe(string transactionCode) =>
        !string.IsNullOrWhiteSpace(transactionCode) &&
        transactionCode.Length <= MaxVnPayTransactionCodeLength &&
        transactionCode.All(char.IsLetterOrDigit);

    private static string ToSnakeCase<TEnum>(TEnum value) where TEnum : struct, Enum =>
        string.Concat(
            value.ToString()
                .Select((character, index) =>
                    index > 0 && char.IsUpper(character)
                        ? $"_{char.ToLowerInvariant(character)}"
                        : char.ToLowerInvariant(character).ToString()));

    private static TransactionScope CreateTransactionScope() =>
        new(TransactionScopeOption.Required, TransactionScopeAsyncFlowOption.Enabled);
}
