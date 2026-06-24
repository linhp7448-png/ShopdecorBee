using FluentAssertions;
using HomeDecorShop.Application;
using HomeDecorShop.Domain;
using Moq;

namespace HomeDecorShop.Tests;

/// <summary>White-box: PaymentService (GetMine, GetByOrderId, GetById, CreateVnPayPayment, Process)</summary>
public class PaymentServiceTests
{
    private readonly Mock<IPaymentRepository> _payments = new();
    private readonly Mock<IOrderRepository> _orders = new();
    private readonly Mock<IUserRepository> _users = new();
    private readonly Mock<IWalletService> _walletService = new();
    private readonly PaymentService _service;

    public PaymentServiceTests()
    {
        _service = new PaymentService(_payments.Object, _orders.Object, _users.Object, _walletService.Object);
    }

    private static User Customer => new()
    {
        UserId = 1,
        CurrentToken = "tok",
        Role = UserRole.Customer
    };

    [Fact]
    public void GetMine_ShouldReturnPayments()
    {
        _users.Setup(r => r.GetByToken("tok")).Returns(Customer);
        _payments.Setup(r => r.GetByUserId(1)).Returns(new[]
        {
            new Payment
            {
                Id = 1,
                OrderId = 10,
                Method = "cod",
                Status = PaymentStatus.Paid,
                Amount = 1000,
                TransactionCode = "PAY-1",
                Order = new Order { Id = 10, UserId = 1, OrderNumber = "ORD-10" },
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            }
        });

        _service.GetMine("tok").Should().HaveCount(1);
    }

    [Fact]
    public void GetByOrderId_ShouldThrowNotFound_WhenOrderNotOwned()
    {
        _users.Setup(r => r.GetByToken("tok")).Returns(Customer);
        _orders.Setup(r => r.GetById(10)).Returns(new Order { Id = 10, UserId = 999 });

        var act = () => _service.GetByOrderId("tok", 10);
        act.Should().Throw<NotFoundException>();
    }

    [Fact]
    public void GetById_ShouldReturnNull_WhenPaymentNotOwned()
    {
        _users.Setup(r => r.GetByToken("tok")).Returns(Customer);
        _payments.Setup(r => r.GetById(1)).Returns(new Payment
        {
            Id = 1,
            OrderId = 10,
            Order = new Order { Id = 10, UserId = 999, OrderNumber = "ORD-10" }
        });

        _service.GetById("tok", 1).Should().BeNull();
    }

    [Fact]
    public void CreateVnPayPayment_ShouldThrowConflict_WhenOrderAlreadyPaid()
    {
        _users.Setup(r => r.GetByToken("tok")).Returns(Customer);
        _orders.Setup(r => r.GetById(10)).Returns(new Order
        {
            Id = 10,
            UserId = 1,
            Status = OrderStatus.Processing,
            PaymentStatus = PaymentStatus.Paid,
            TotalAmount = 1000,
            OrderNumber = "ORD-10"
        });

        var act = () => _service.CreateVnPayPayment("tok", new VnPayCreateUrlInput
        {
            OrderId = 10
        });

        act.Should().Throw<ConflictException>();
    }

    [Fact]
    public void Process_ShouldThrowNotFound_WhenOrderNotFound()
    {
        _users.Setup(r => r.GetByToken("tok")).Returns(Customer);
        _orders.Setup(r => r.GetById(10)).Returns((Order?)null);

        var act = () => _service.Process("tok", new PaymentProcessInput { OrderId = 10, Method = "cod" });
        act.Should().Throw<NotFoundException>();
    }

    [Fact]
    public void GetMine_ShouldReturnEmpty_WhenNoPayments()
    {
        _users.Setup(r => r.GetByToken("tok")).Returns(Customer);
        _payments.Setup(r => r.GetByUserId(1)).Returns(Array.Empty<Payment>());

        _service.GetMine("tok").Should().BeEmpty();
    }

    [Fact]
    public void GetByOrderId_ShouldReturnPayments_WhenOrderOwned()
    {
        _users.Setup(r => r.GetByToken("tok")).Returns(Customer);
        var order = new Order { Id = 10, UserId = 1, OrderNumber = "ORD-10" };
        _orders.Setup(r => r.GetById(10)).Returns(order);
        _payments.Setup(r => r.GetByOrderId(10)).Returns(new[]
        {
            new Payment
            {
                Id = 1,
                OrderId = 10,
                Method = "cod",
                Status = PaymentStatus.Paid,
                Amount = 1000,
                TransactionCode = "PAY-1",
                Order = order,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            }
        });

        var result = _service.GetByOrderId("tok", 10);
        result.Should().HaveCount(1);
    }

    [Fact]
    public void GetById_ShouldReturnPayment_WhenPaymentOwned()
    {
        _users.Setup(r => r.GetByToken("tok")).Returns(Customer);
        var order = new Order { Id = 10, UserId = 1, OrderNumber = "ORD-10" };
        _payments.Setup(r => r.GetById(1)).Returns(new Payment
        {
            Id = 1,
            OrderId = 10,
            Order = order,
            Method = "cod",
            Status = PaymentStatus.Paid,
            Amount = 1000,
            TransactionCode = "PAY-1",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        });

        var result = _service.GetById("tok", 1);
        result.Should().NotBeNull();
        result!.Method.Should().Be("cod");
    }

    [Fact]
    public void CreateVnPayPayment_ShouldReturnUrl_WhenOrderPendingPayment()
    {
        _users.Setup(r => r.GetByToken("tok")).Returns(Customer);
        var order = new Order
        {
            Id = 10,
            UserId = 1,
            Status = OrderStatus.PendingPayment,
            PaymentStatus = PaymentStatus.Pending,
            TotalAmount = 1000,
            OrderNumber = "ORD-10"
        };
        _orders.Setup(r => r.GetById(10)).Returns(order);
        _payments.Setup(r => r.GetByOrderId(10)).Returns(Array.Empty<Payment>());
        _payments.Setup(r => r.Create(It.IsAny<Payment>())).Returns<Payment>(p => p);

        var result = _service.CreateVnPayPayment("tok", new VnPayCreateUrlInput { OrderId = 10 });

        result.Should().NotBeNull();
        result.OrderNumber.Should().Be("ORD-10");
        result.Amount.Should().Be(1000);
    }

    [Fact]
    public void Process_ShouldReturnPayment_WhenOrderPendingPayment()
    {
        _users.Setup(r => r.GetByToken("tok")).Returns(Customer);
        var order = new Order
        {
            Id = 10,
            UserId = 1,
            Status = OrderStatus.PendingPayment,
            PaymentStatus = PaymentStatus.Pending,
            TotalAmount = 1000,
            OrderNumber = "ORD-10"
        };
        _orders.Setup(r => r.GetById(10)).Returns(order);
        _payments.Setup(r => r.Create(It.IsAny<Payment>())).Returns<Payment>(p => { p.Order = order; return p; });
        _orders.Setup(r => r.Update(It.IsAny<Order>())).Returns<Order>(o => o);
        _walletService.Setup(w => w.AddToAdminWallet(It.IsAny<decimal>(), It.IsAny<string>(), It.IsAny<string>()));

        var result = _service.Process("tok", new PaymentProcessInput { OrderId = 10, Method = "cod" });

        result.Should().NotBeNull();
        result.Method.Should().Be("cod");
        result.Amount.Should().Be(1000);
    }
}

