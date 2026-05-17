using System.Transactions;
using HomeDecorShop.Domain;

namespace HomeDecorShop.Application;

public sealed class OrderService(
    IOrderRepository orderRepository,
    ICartRepository cartRepository,
    IUserRepository userRepository,
    IProductRepository productRepository,
    IPaymentRepository paymentRepository,
    IWalletService walletService) : IOrderService
{
    private const decimal FlatShippingFee = 30000m;

    public IReadOnlyCollection<OrderView> GetMine(string token)
    {
        var user = RequireUser(token);
        return orderRepository.GetByUserId(user.UserId)
            .OrderByDescending(o => o.CreatedAt)
            .Select(MapOrder)
            .ToArray();
    }

    public IReadOnlyCollection<OrderView> GetAll(string token)
    {
        var user = RequireUser(token);
        if (user.Role != UserRole.Admin)
        {
            throw new ForbiddenException("Bạn không có quyền thực hiện hành động này.");
        }

        return orderRepository.GetAll()
            .OrderByDescending(o => o.CreatedAt)
            .Select(MapOrder)
            .ToArray();
    }

    public OrderView? GetById(string token, int orderId)
    {
        var user = RequireUser(token);
        var order = orderRepository.GetById(orderId);
        return order is null || order.UserId != user.UserId
            ? null
            : MapOrder(order);
    }

    public OrderView PlaceOrder(string token, PlaceOrderInput input)
    {
        var user = RequireUser(token);
        var cart = cartRepository.GetByUserId(user.UserId);
        if (cart is null || cart.Items.Count == 0)
        {
            throw CreateEmptyCartException();
        }

        var shipping = ResolveShippingAddress(user, input);
        var now = DateTime.UtcNow;
        var cartItems = cart.Items.OrderBy(item => item.Id).ToArray();

        foreach (var cartItem in cartItems)
        {
            var product = productRepository.GetById(cartItem.ProductId)
                ?? throw new NotFoundException($"Product with id {cartItem.ProductId} was not found.", AppErrorCodes.ProductNotFound);
            ValidateProductForOrder(product, cartItem.Quantity);
        }

        var orderItems = cartItems
            .Select(cartItem =>
            {
                var product = productRepository.GetById(cartItem.ProductId)!;
                return new OrderItem
                {
                    ProductId = product.ProductId,
                    ProductName = product.ProductName,
                    ProductSku = product.Sku,
                    ProductImage = product.Image,
                    UnitPrice = product.Price,
                    Quantity = cartItem.Quantity,
                    LineTotal = product.Price * cartItem.Quantity
                };
            })
            .ToArray();

        var subtotal = orderItems.Sum(item => item.LineTotal);
        var order = new Order
        {
            UserId = user.UserId,
            OrderNumber = $"ORD-{now:yyyyMMddHHmmssfff}-{user.UserId}",
            Status = OrderStatus.PendingPayment,
            PaymentStatus = PaymentStatus.Pending,
            Subtotal = subtotal,
            ShippingFee = FlatShippingFee,
            TotalAmount = subtotal + FlatShippingFee,
            FullName = shipping.FullName,
            Phone = shipping.Phone,
            Line1 = shipping.Line1,
            Ward = shipping.Ward,
            District = shipping.District,
            City = shipping.City,
            Notes = NormalizeOptional(input.Notes),
            CreatedAt = now,
            UpdatedAt = now,
            Items = orderItems
        };

        using var scope = CreateTransactionScope();

        foreach (var orderItem in orderItems)
        {
            if (!orderItem.ProductId.HasValue)
            {
                continue;
            }

            var product = productRepository.GetById(orderItem.ProductId.Value)!;
            DecreaseStock(product, orderItem.Quantity);
            _ = productRepository.Update(product);
        }

        var created = orderRepository.Create(order);
        cart.Items.Clear();
        cart.UpdatedAt = now;
        _ = cartRepository.Update(cart);

        scope.Complete();
        return MapOrder(created);
    }

    public OrderView? Cancel(string token, int orderId)
    {
        var user = RequireUser(token);
        var order = orderRepository.GetById(orderId);
        if (order is null || order.UserId != user.UserId)
        {
            return null;
        }

        if (order.Status != OrderStatus.PendingPayment)
        {
            throw new ConflictException("Only unpaid orders can be cancelled.", AppErrorCodes.OrderCannotBeCancelled);
        }

        var hasPendingVnPayPayment = paymentRepository
            .GetByOrderId(order.Id)
            .Any(payment =>
                string.Equals(payment.Method, "vnpay", StringComparison.OrdinalIgnoreCase) &&
                payment.Status == PaymentStatus.Pending);

        if (hasPendingVnPayPayment)
        {
            throw new ConflictException(
                "Orders with a pending VNPay transaction cannot be cancelled.",
                AppErrorCodes.OrderCannotBeCancelled);
        }

        using var scope = CreateTransactionScope();

        foreach (var item in order.Items.Where(item => item.ProductId.HasValue))
        {
            var product = productRepository.GetById(item.ProductId!.Value);
            if (product is null)
            {
                continue;
            }

            RestoreStock(product, item.Quantity);
            _ = productRepository.Update(product);
        }

        order.Status = OrderStatus.Cancelled;
        order.PaymentStatus = PaymentStatus.Cancelled;
        order.UpdatedAt = DateTime.UtcNow;

        var updated = orderRepository.Update(order);
        scope.Complete();
        return MapOrder(updated);
    }

    public OrderView? UpdateStatus(string token, int orderId, string status)
    {
        var user = RequireUser(token);
        if (user.Role != UserRole.Admin)
        {
            throw new ForbiddenException("Bạn không có quyền thực hiện hành động này.");
        }

        var order = orderRepository.GetById(orderId);
        if (order is null)
        {
            return null;
        }

        var newStatus = MapFromSnakeCase<OrderStatus>(status);
        order.Status = newStatus;
        order.UpdatedAt = DateTime.UtcNow;

        // Auto-update payment status if completed
        if (newStatus == OrderStatus.Completed)
        {
            order.PaymentStatus = PaymentStatus.Paid;
        }

        return MapOrder(orderRepository.Update(order));
    }

    public OrderView? RequestRefund(string token, int orderId, string? reason)
    {
        var user = RequireUser(token);
        var order = orderRepository.GetById(orderId);
        if (order is null || order.UserId != user.UserId)
        {
            return null;
        }

        if (order.PaymentStatus != PaymentStatus.Paid)
        {
            throw new ConflictException("Chỉ đơn hàng đã thanh toán mới được khiếu nại.");
        }

        if (order.Status == OrderStatus.RefundRequested || order.Status == OrderStatus.Refunded)
        {
            throw new ConflictException("Đơn hàng này đã gửi yêu cầu khiếu nại hoặc đã được hoàn tiền.");
        }

        order.Status = OrderStatus.RefundRequested;
        
        if (!string.IsNullOrWhiteSpace(reason))
        {
            var prefix = string.IsNullOrWhiteSpace(order.Notes) ? "" : $"{order.Notes} | ";
            order.Notes = $"{prefix}[KHIẾU NẠI]: {reason}";
        }

        order.UpdatedAt = DateTime.UtcNow;

        return MapOrder(orderRepository.Update(order));
    }

    public OrderView? ProcessRefund(string token, int orderId, bool approve)
    {
        var user = RequireUser(token);
        if (user.Role != UserRole.Admin)
        {
            throw new ForbiddenException("Bạn không có quyền thực hiện hành động này.");
        }

        var order = orderRepository.GetById(orderId);
        if (order is null)
        {
            return null;
        }

        if (order.Status != OrderStatus.RefundRequested)
        {
            throw new ConflictException("Đơn hàng không ở trạng thái yêu cầu khiếu nại.");
        }

        using var scope = CreateTransactionScope();

        if (approve)
        {
            order.Status = OrderStatus.Refunded;
            order.PaymentStatus = PaymentStatus.Refunded;

            // Refund logic
            walletService.ProcessRefundPayment(order.UserId, order.TotalAmount, order.OrderNumber);
        }
        else
        {
            order.Status = OrderStatus.Completed; // Rejecting refund sets it back to Completed
        }

        order.UpdatedAt = DateTime.UtcNow;
        var updated = orderRepository.Update(order);

        scope.Complete();
        return MapOrder(updated);
    }

    private User RequireUser(string token) =>
        userRepository.GetByToken(token.Trim())
        ?? throw new UnauthorizedException("Authentication token is invalid or has expired.", AppErrorCodes.AuthTokenInvalid);

    private static void ValidateProductForOrder(Product product, int quantity)
    {
        if (!product.IsActive || product.CategoryNavigation is { IsActive: false })
        {
            throw new ConflictException($"Product {product.ProductId} is inactive and cannot be ordered.", AppErrorCodes.ProductInactive);
        }

        if (GetAvailableStock(product) < quantity)
        {
            throw new ConflictException($"Product {product.ProductId} does not have enough stock.", AppErrorCodes.ProductStockExceeded);
        }
    }

    private static void DecreaseStock(Product product, int quantity)
    {
        product.StockLeft = Math.Max(product.StockLeft - quantity, 0);
        product.InStock = product.StockLeft > 0;
    }

    private static void RestoreStock(Product product, int quantity)
    {
        product.StockLeft += quantity;
        product.InStock = true;
    }

    private static int GetAvailableStock(Product product)
    {
        return Math.Max(product.StockLeft, 0);
    }

    private static (string FullName, string Phone, string Line1, string Ward, string District, string City) ResolveShippingAddress(
        User user,
        PlaceOrderInput input)
    {
        if (input.AddressId is int addressId)
        {
            var address = user.Addresses.FirstOrDefault(item => item.Id == addressId);
            if (address is null)
            {
                throw new RequestValidationException(
                    "Shipping address is invalid.",
                    new Dictionary<string, string[]>
                    {
                        ["addressId"] = ["Selected address was not found for the current user."]
                    },
                    AppErrorCodes.ShippingAddressInvalid);
            }

            return (address.FullName, address.Phone, address.Line1, address.Ward, address.District, address.City);
        }

        if (!string.IsNullOrWhiteSpace(input.FullName) &&
            !string.IsNullOrWhiteSpace(input.Phone) &&
            !string.IsNullOrWhiteSpace(input.Line1) &&
            !string.IsNullOrWhiteSpace(input.Ward) &&
            !string.IsNullOrWhiteSpace(input.District) &&
            !string.IsNullOrWhiteSpace(input.City))
        {
            return (
                input.FullName.Trim(),
                input.Phone.Trim(),
                input.Line1.Trim(),
                input.Ward.Trim(),
                input.District.Trim(),
                input.City.Trim());
        }

        var defaultAddress = user.Addresses
            .OrderByDescending(address => address.IsDefault)
            .ThenBy(address => address.Id)
            .FirstOrDefault();

        if (defaultAddress is not null)
        {
            return (
                defaultAddress.FullName,
                defaultAddress.Phone,
                defaultAddress.Line1,
                defaultAddress.Ward,
                defaultAddress.District,
                defaultAddress.City);
        }

        throw new RequestValidationException(
            "Shipping information is required.",
            new Dictionary<string, string[]>
            {
                ["address"] = ["Provide addressId or full shipping address fields."]
            },
            AppErrorCodes.ShippingInfoRequired);
    }

    private static OrderView MapOrder(Order order) =>
        new(
            order.Id,
            order.OrderNumber,
            ToSnakeCase(order.Status),
            ToSnakeCase(order.PaymentStatus),
            order.Subtotal,
            order.ShippingFee,
            order.TotalAmount,
            order.FullName,
            order.Phone,
            order.Line1,
            order.Ward,
            order.District,
            order.City,
            order.Notes,
            order.CreatedAt,
            order.UpdatedAt,
            order.Items
                .OrderBy(item => item.Id)
                .Select(item => new OrderItemView(
                    item.Id,
                    item.ProductId,
                    item.ProductName,
                    item.ProductSku,
                    item.ProductImage,
                    item.UnitPrice,
                    item.Quantity,
                    item.LineTotal))
                .ToArray());

    private static string NormalizeOptional(string? value) =>
        string.IsNullOrWhiteSpace(value) ? string.Empty : value.Trim();

    private static string ToSnakeCase<TEnum>(TEnum value) where TEnum : struct, Enum =>
        string.Concat(
            value.ToString()
                .Select((character, index) =>
                    index > 0 && char.IsUpper(character)
                        ? $"_{char.ToLowerInvariant(character)}"
                        : char.ToLowerInvariant(character).ToString()));

    private static TEnum MapFromSnakeCase<TEnum>(string value) where TEnum : struct, Enum
    {
        var normalized = string.Concat(
            value.Split('_')
                .Select(part => char.ToUpperInvariant(part[0]) + (part.Length > 1 ? part[1..] : "")));
        
        return Enum.TryParse<TEnum>(normalized, true, out var result) ? result : default;
    }

    private static TransactionScope CreateTransactionScope() =>
        new(TransactionScopeOption.Required, TransactionScopeAsyncFlowOption.Enabled);

    private static RequestValidationException CreateEmptyCartException() =>
        new(
            "Cart is empty.",
            new Dictionary<string, string[]>
            {
                ["cart"] = ["Cart does not contain any items."]
            },
            AppErrorCodes.CartEmpty);
}