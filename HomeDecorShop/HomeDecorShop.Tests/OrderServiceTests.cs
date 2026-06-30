using FluentAssertions;
using HomeDecorShop.Application;
using HomeDecorShop.Domain;
using Moq;

namespace HomeDecorShop.Tests;

public class OrderServiceTests
{
    private readonly Mock<IOrderRepository> _orders = new();
    private readonly Mock<ICartRepository> _carts = new();
    private readonly Mock<IUserRepository> _users = new();
    private readonly Mock<IProductRepository> _products = new();
    private readonly Mock<IPaymentRepository> _payments = new();
    private readonly Mock<IWalletService> _wallet = new();
    private readonly OrderService _service;

    public OrderServiceTests()
    {
        _service = new OrderService(
            _orders.Object, _carts.Object, _users.Object,
            _products.Object, _payments.Object, _wallet.Object);
    }

    private static User Customer => new()
    {
        UserId = 1,
        CurrentToken = "tok",
        Role = UserRole.Customer,
        Addresses = new List<Address>()
    };

    private static User Admin => new()
    {
        UserId = 2,
        CurrentToken = "admin-tok",
        Role = UserRole.Admin,
        Addresses = new List<Address>()
    };

    [Fact]
    public void GetMine_ShouldReturnUserOrders()
    {
        _users.Setup(r => r.GetByToken("tok")).Returns(Customer);
        _orders.Setup(r => r.GetByUserId(1)).Returns(new[]
        {
            new Order { Id = 1, UserId = 1, OrderNumber = "ORD-1", Items = new List<OrderItem>(), CreatedAt = DateTime.UtcNow }
        });

        _service.GetMine("tok").Should().HaveCount(1);
    }

    [Fact]
    public void GetById_ShouldReturnNull_WhenOrderBelongsToAnotherUser()
    {
        _users.Setup(r => r.GetByToken("tok")).Returns(Customer);
        _orders.Setup(r => r.GetById(1)).Returns(new Order { Id = 1, UserId = 99, Items = new List<OrderItem>() });

        _service.GetById("tok", 1).Should().BeNull();
    }

    [Fact]
    public void PlaceOrder_ShouldThrow_WhenCartEmpty()
    {
        _users.Setup(r => r.GetByToken("tok")).Returns(Customer);
        _carts.Setup(r => r.GetByUserId(1)).Returns((Cart?)null);

        var act = () => _service.PlaceOrder("tok", new PlaceOrderInput
        {
            FullName = "A", Phone = "0901234567", Line1 = "123 St",
            Ward = "W", District = "D", City = "HCM"
        });

        act.Should().Throw<RequestValidationException>();
    }

    [Fact]
    public void Cancel_ShouldReturnNull_WhenOrderNotFound()
    {
        _users.Setup(r => r.GetByToken("tok")).Returns(Customer);
        _orders.Setup(r => r.GetById(1)).Returns((Order?)null);

        _service.Cancel("tok", 1).Should().BeNull();
    }

    [Fact]
    public void Cancel_ShouldThrow_WhenOrderAlreadyPaid()
    {
        _users.Setup(r => r.GetByToken("tok")).Returns(Customer);
        _orders.Setup(r => r.GetById(1)).Returns(new Order
        {
            Id = 1, UserId = 1, Status = OrderStatus.Processing, Items = new List<OrderItem>()
        });
        _payments.Setup(r => r.GetByOrderId(1)).Returns(Array.Empty<Payment>());

        var act = () => _service.Cancel("tok", 1);

        act.Should().Throw<ConflictException>();
    }

    [Fact]
    public void UpdateStatus_ShouldThrowForbidden_WhenNotAdmin()
    {
        _users.Setup(r => r.GetByToken("tok")).Returns(Customer);

        var act = () => _service.UpdateStatus("tok", 1, "processing");

        act.Should().Throw<ForbiddenException>();
    }

    [Fact]
    public void UpdateStatus_ShouldUpdate_WhenAdmin()
    {
        _users.Setup(r => r.GetByToken("admin-tok")).Returns(Admin);
        var order = new Order
        {
            Id = 1, UserId = 1, Status = OrderStatus.PendingPayment,
            Items = new List<OrderItem>(), PaymentStatus = PaymentStatus.Pending
        };
        _orders.Setup(r => r.GetById(1)).Returns(order);
        _orders.Setup(r => r.Update(It.IsAny<Order>())).Returns<Order>(o => o);

        var result = _service.UpdateStatus("admin-tok", 1, "processing");

        result!.Status.Should().Be("processing");
    }

    [Fact]
    public void GetById_ShouldReturnOrder_WhenOwnedByUser()
    {
        _users.Setup(r => r.GetByToken("tok")).Returns(Customer);
        var order = new Order
        {
            Id = 1, UserId = 1, OrderNumber = "ORD-1", Items = new List<OrderItem>(),
            Status = OrderStatus.PendingPayment, PaymentStatus = PaymentStatus.Pending
        };
        _orders.Setup(r => r.GetById(1)).Returns(order);

        var result = _service.GetById("tok", 1);

        result.Should().NotBeNull();
        result!.OrderNumber.Should().Be("ORD-1");
    }

    [Fact]
    public void PlaceOrder_ShouldReturnOrder_WhenCartHasItems()
    {
        _users.Setup(r => r.GetByToken("tok")).Returns(Customer);
        var cart = new Cart
        {
            UserId = 1,
            Items = new List<CartItem>
            {
                new CartItem
                {
                    Id = 1,
                    ProductId = 100,
                    Quantity = 2,
                    UnitPrice = 50000,
                    Product = new Product
                    {
                        ProductId = 100,
                        ProductName = "Chair",
                        Sku = "SKU1",
                        Price = 50000,
                        IsActive = true,
                        StockLeft = 10,
                        CategoryNavigation = new Category { IsActive = true }
                    }
                }
            }
        };
        _carts.Setup(r => r.GetByUserId(1)).Returns(cart);
        _products.Setup(r => r.GetById(100)).Returns(cart.Items.First().Product);
        _orders.Setup(r => r.Create(It.IsAny<Order>())).Returns<Order>(o => o);
        _orders.Setup(r => r.GetById(It.IsAny<int>())).Returns<Order>(o => o);
        _products.Setup(r => r.Update(It.IsAny<Product>())).Returns<Product>(p => p);
        _carts.Setup(r => r.Update(It.IsAny<Cart>())).Returns<Cart>(c => c);

        var result = _service.PlaceOrder("tok", new PlaceOrderInput
        {
            FullName = "Test User",
            Phone = "0901234567",
            Line1 = "123 St",
            Ward = "W",
            District = "D",
            City = "HCM"
        });

        result.Should().NotBeNull();
        result.OrderNumber.Should().StartWith("ORD-");
    }

    [Fact]
    public void Cancel_ShouldReturnOrder_WhenOrderIsPendingPayment()
    {
        _users.Setup(r => r.GetByToken("tok")).Returns(Customer);
        var order = new Order
        {
            Id = 1,
            UserId = 1,
            OrderNumber = "ORD-1",
            Status = OrderStatus.PendingPayment,
            PaymentStatus = PaymentStatus.Pending,
            Items = new List<OrderItem>
            {
                new OrderItem { ProductId = 100, Quantity = 2 }
            }
        };
        _orders.Setup(r => r.GetById(1)).Returns(order);
        _payments.Setup(r => r.GetByOrderId(1)).Returns(Array.Empty<Payment>());
        _orders.Setup(r => r.Update(It.IsAny<Order>())).Returns<Order>(o => o);
        _products.Setup(r => r.GetById(100)).Returns(new Product { ProductId = 100, StockLeft = 5 });
        _products.Setup(r => r.Update(It.IsAny<Product>())).Returns<Product>(p => p);

        var result = _service.Cancel("tok", 1);

        result.Should().NotBeNull();
        result!.Status.Should().Be("cancelled");
    }

    [Fact]
    public void GetById_ShouldReturnNull_WhenOrderNotFound()
    {
        _users.Setup(r => r.GetByToken("tok")).Returns(Customer);
        _orders.Setup(r => r.GetById(1)).Returns((Order?)null);
        _service.GetById("tok", 1).Should().BeNull();
    }

    [Fact]
    public void PlaceOrder_ShouldThrow_WhenCartItemsEmpty()
    {
        _users.Setup(r => r.GetByToken("tok")).Returns(Customer);
        _carts.Setup(r => r.GetByUserId(1)).Returns(new Cart { Items = new List<CartItem>() });
        var act = () => _service.PlaceOrder("tok", new PlaceOrderInput());
        act.Should().Throw<RequestValidationException>().WithMessage("*Cart is empty*");
    }

    [Fact]
    public void PlaceOrder_ShouldThrow_WhenAddressIdInvalid()
    {
        _users.Setup(r => r.GetByToken("tok")).Returns(Customer);
        _carts.Setup(r => r.GetByUserId(1)).Returns(new Cart { Items = new List<CartItem> { new CartItem() } });
        var act = () => _service.PlaceOrder("tok", new PlaceOrderInput { AddressId = 999 });
        act.Should().Throw<RequestValidationException>().WithMessage("*Shipping address is invalid*");
    }

    [Fact]
    public void PlaceOrder_ShouldUseDefaultAddress_WhenNoInputAddressProvided()
    {
        var customerWithAddress = new User { UserId = 1, Role = UserRole.Customer, Addresses = new List<Address> { new Address { Id = 1, IsDefault = true, FullName = "Def", Phone = "01", Line1 = "1", Ward = "w", District = "d", City = "c" } } };
        _users.Setup(r => r.GetByToken("tok")).Returns(customerWithAddress);
        var cart = new Cart { Items = new List<CartItem> { new CartItem { ProductId = 100, Quantity = 1 } } };
        _carts.Setup(r => r.GetByUserId(1)).Returns(cart);
        _products.Setup(r => r.GetById(100)).Returns(new Product { ProductId = 100, Price = 10, IsActive = true, StockLeft = 10, CategoryNavigation = new Category { IsActive = true } });
        _orders.Setup(r => r.Create(It.IsAny<Order>())).Returns<Order>(o => o);
        
        var res = _service.PlaceOrder("tok", new PlaceOrderInput());
        res.FullName.Should().Be("Def");
    }

    [Fact]
    public void PlaceOrder_ShouldThrow_WhenNoShippingInfoAndNoDefaultAddress()
    {
        _users.Setup(r => r.GetByToken("tok")).Returns(Customer);
        var cart = new Cart { Items = new List<CartItem> { new CartItem { ProductId = 100, Quantity = 1 } } };
        _carts.Setup(r => r.GetByUserId(1)).Returns(cart);
        
        var act = () => _service.PlaceOrder("tok", new PlaceOrderInput());
        act.Should().Throw<RequestValidationException>().WithMessage("*Shipping information is required*");
    }

    [Fact]
    public void PlaceOrder_ShouldThrow_WhenProductNotFound()
    {
        _users.Setup(r => r.GetByToken("tok")).Returns(Customer);
        var cart = new Cart { Items = new List<CartItem> { new CartItem { ProductId = 100, Quantity = 1 } } };
        _carts.Setup(r => r.GetByUserId(1)).Returns(cart);
        _products.Setup(r => r.GetById(100)).Returns((Product?)null);
        
        var act = () => _service.PlaceOrder("tok", new PlaceOrderInput { FullName = "A", Phone = "0", Line1 = "1", Ward = "w", District = "d", City = "c" });
        act.Should().Throw<NotFoundException>();
    }

    [Fact]
    public void PlaceOrder_ShouldThrow_WhenProductInactive()
    {
        _users.Setup(r => r.GetByToken("tok")).Returns(Customer);
        var cart = new Cart { Items = new List<CartItem> { new CartItem { ProductId = 100, Quantity = 1 } } };
        _carts.Setup(r => r.GetByUserId(1)).Returns(cart);
        _products.Setup(r => r.GetById(100)).Returns(new Product { ProductId = 100, IsActive = false });
        
        var act = () => _service.PlaceOrder("tok", new PlaceOrderInput { FullName = "A", Phone = "0", Line1 = "1", Ward = "w", District = "d", City = "c" });
        act.Should().Throw<ConflictException>();
    }

    [Fact]
    public void PlaceOrder_ShouldThrow_WhenProductOutOfStock()
    {
        _users.Setup(r => r.GetByToken("tok")).Returns(Customer);
        var cart = new Cart { Items = new List<CartItem> { new CartItem { ProductId = 100, Quantity = 5 } } };
        _carts.Setup(r => r.GetByUserId(1)).Returns(cart);
        _products.Setup(r => r.GetById(100)).Returns(new Product { ProductId = 100, IsActive = true, StockLeft = 2, CategoryNavigation = new Category { IsActive = true } });
        
        var act = () => _service.PlaceOrder("tok", new PlaceOrderInput { FullName = "A", Phone = "0", Line1 = "1", Ward = "w", District = "d", City = "c" });
        act.Should().Throw<ConflictException>();
    }

    [Fact]
    public void Cancel_ShouldThrow_WhenHasPendingVnPay()
    {
        _users.Setup(r => r.GetByToken("tok")).Returns(Customer);
        _orders.Setup(r => r.GetById(1)).Returns(new Order { Id = 1, UserId = 1, Status = OrderStatus.PendingPayment, Items = new List<OrderItem>() });
        _payments.Setup(r => r.GetByOrderId(1)).Returns(new[] { new Payment { Method = "vnpay", Status = PaymentStatus.Pending } });
        
        var act = () => _service.Cancel("tok", 1);
        act.Should().Throw<ConflictException>().WithMessage("*pending VNPay*");
    }

    [Fact]
    public void UpdateStatus_ShouldReturnNull_WhenOrderNotFound()
    {
        _users.Setup(r => r.GetByToken("admin-tok")).Returns(Admin);
        _orders.Setup(r => r.GetById(1)).Returns((Order?)null);
        _service.UpdateStatus("admin-tok", 1, "processing").Should().BeNull();
    }

    [Fact]
    public void UpdateStatus_ShouldUpdatePaymentStatusToPaid_WhenCompleted()
    {
        _users.Setup(r => r.GetByToken("admin-tok")).Returns(Admin);
        var order = new Order { Id = 1, UserId = 1, Status = OrderStatus.Processing, PaymentStatus = PaymentStatus.Pending, Items = new List<OrderItem>() };
        _orders.Setup(r => r.GetById(1)).Returns(order);
        _orders.Setup(r => r.Update(It.IsAny<Order>())).Returns<Order>(o => o);
        
        var result = _service.UpdateStatus("admin-tok", 1, "completed");
        result!.Status.Should().Be("completed");
        result.PaymentStatus.Should().Be("paid");
    }
    [Fact]
    public void RequestRefund_ShouldReturnNull_WhenOrderNotFoundOrNotOwned()
    {
        _users.Setup(r => r.GetByToken("tok")).Returns(Customer);
        _orders.Setup(r => r.GetById(1)).Returns(new Order { Id = 1, UserId = 99, Items = new List<OrderItem>() });
        _service.RequestRefund("tok", 1, "Lý do").Should().BeNull();
    }

    [Fact]
    public void RequestRefund_ShouldThrow_WhenPaymentNotPaid()
    {
        _users.Setup(r => r.GetByToken("tok")).Returns(Customer);
        _orders.Setup(r => r.GetById(1)).Returns(new Order { Id = 1, UserId = 1, PaymentStatus = PaymentStatus.Pending, Items = new List<OrderItem>() });
        var act = () => _service.RequestRefund("tok", 1, "Lý do");
        act.Should().Throw<ConflictException>().WithMessage("*đã thanh toán mới được khiếu nại*");
    }

    [Fact]
    public void RequestRefund_ShouldThrow_WhenAlreadyRefundRequested()
    {
        _users.Setup(r => r.GetByToken("tok")).Returns(Customer);
        _orders.Setup(r => r.GetById(1)).Returns(new Order { Id = 1, UserId = 1, PaymentStatus = PaymentStatus.Paid, Status = OrderStatus.RefundRequested, Items = new List<OrderItem>() });
        var act = () => _service.RequestRefund("tok", 1, "Lý do");
        act.Should().Throw<ConflictException>().WithMessage("*đã gửi yêu cầu khiếu nại*");
    }

    [Fact]
    public void RequestRefund_ShouldUpdateStatusAndNotes_WhenValid()
    {
        _users.Setup(r => r.GetByToken("tok")).Returns(Customer);
        var order = new Order { Id = 1, UserId = 1, PaymentStatus = PaymentStatus.Paid, Status = OrderStatus.Completed, Items = new List<OrderItem>() };
        _orders.Setup(r => r.GetById(1)).Returns(order);
        _orders.Setup(r => r.Update(It.IsAny<Order>())).Returns<Order>(o => o);

        var result = _service.RequestRefund("tok", 1, "Hàng vỡ");

        result!.Status.Should().Be("refund_requested");
        order.Notes.Should().Contain("[KHIẾU NẠI]: Hàng vỡ");
    }

    [Fact]
    public void ProcessRefund_ShouldThrow_WhenNotAdmin()
    {
        _users.Setup(r => r.GetByToken("tok")).Returns(Customer);
        var act = () => _service.ProcessRefund("tok", 1, true);
        act.Should().Throw<ForbiddenException>();
    }

    [Fact]
    public void ProcessRefund_ShouldThrow_WhenNotRefundRequested()
    {
        _users.Setup(r => r.GetByToken("admin-tok")).Returns(Admin);
        _orders.Setup(r => r.GetById(1)).Returns(new Order { Id = 1, Status = OrderStatus.Completed, Items = new List<OrderItem>() });
        var act = () => _service.ProcessRefund("admin-tok", 1, true);
        act.Should().Throw<ConflictException>().WithMessage("*Đơn hàng không ở trạng thái*");
    }

    [Fact]
    public void ProcessRefund_ShouldRefundToWallet_WhenApproved()
    {
        _users.Setup(r => r.GetByToken("admin-tok")).Returns(Admin);
        var order = new Order { Id = 1, UserId = 1, Status = OrderStatus.RefundRequested, TotalAmount = 1000, OrderNumber = "O-1", Items = new List<OrderItem>() };
        _orders.Setup(r => r.GetById(1)).Returns(order);
        _orders.Setup(r => r.Update(It.IsAny<Order>())).Returns<Order>(o => o);

        var result = _service.ProcessRefund("admin-tok", 1, true);

        result!.Status.Should().Be("refunded");
        result.PaymentStatus.Should().Be("refunded");
        _wallet.Verify(w => w.ProcessRefundPayment(1, 1000, "O-1"), Times.Once);
    }

    [Fact]
    public void ProcessRefund_ShouldSetToCompleted_WhenRejected()
    {
        _users.Setup(r => r.GetByToken("admin-tok")).Returns(Admin);
        var order = new Order { Id = 1, UserId = 1, Status = OrderStatus.RefundRequested, Items = new List<OrderItem>() };
        _orders.Setup(r => r.GetById(1)).Returns(order);
        _orders.Setup(r => r.Update(It.IsAny<Order>())).Returns<Order>(o => o);

        var result = _service.ProcessRefund("admin-tok", 1, false);

        result!.Status.Should().Be("completed");
        _wallet.Verify(w => w.ProcessRefundPayment(It.IsAny<int>(), It.IsAny<decimal>(), It.IsAny<string>()), Times.Never);
    }
}
