using FluentAssertions;
using HomeDecorShop.Application;
using HomeDecorShop.Domain;
using Moq;

namespace HomeDecorShop.Tests;

/// <summary>White-box tests for PaymentService</summary>
public class PaymentServiceTests
{
    private readonly Mock<IPaymentRepository> paymentRepoMock = new();
    private readonly Mock<IOrderRepository> orderRepoMock = new();
    private readonly Mock<IUserRepository> userRepoMock = new();
    private readonly Mock<IWalletService> walletServiceMock = new();

    private readonly PaymentService service;

    public PaymentServiceTests()
    {
        service = new PaymentService(
            paymentRepoMock.Object,
            orderRepoMock.Object,
            userRepoMock.Object,
            walletServiceMock.Object
        );
    }

    private static User DefaultCustomer() => new()
    {
        UserId = 1,
        CurrentToken = "tok",
        Role = UserRole.Customer
    };

    private static Order BuildOrder(int userId, OrderStatus status, PaymentStatus paymentStatus)
        => new()
        {
            Id = 10,
            UserId = userId,
            Status = status,
            PaymentStatus = paymentStatus,
            TotalAmount = 1000,
            OrderNumber = "ORD-10"
        };

    [Fact]
    public void GetMine_ShouldReturnPayments()
    {
        var user = DefaultCustomer();
        userRepoMock.Setup(x => x.GetByToken("tok")).Returns(user);

        paymentRepoMock.Setup(x => x.GetByUserId(1)).Returns(new[]
        {
            new Payment
            {
                Id = 1,
                OrderId = 10,
                Method = "cod",
                Status = PaymentStatus.Paid,
                Amount = 1000,
                TransactionCode = "PAY-1",
                Order = BuildOrder(1, OrderStatus.Processing, PaymentStatus.Paid),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            }
        });

        var result = service.GetMine("tok");

        result.Should().HaveCount(1);
    }

    [Fact]
    public void GetMine_ShouldReturnEmpty_WhenNoPayments()
    {
        userRepoMock.Setup(x => x.GetByToken("tok")).Returns(DefaultCustomer());
        paymentRepoMock.Setup(x => x.GetByUserId(1)).Returns(Array.Empty<Payment>());

        service.GetMine("tok").Should().BeEmpty();
    }

    [Fact]
    public void GetByOrderId_ShouldThrow_WhenOrderNotOwned()
    {
        userRepoMock.Setup(x => x.GetByToken("tok")).Returns(DefaultCustomer());
        orderRepoMock.Setup(x => x.GetById(10)).Returns(new Order { Id = 10, UserId = 999 });

        var act = () => service.GetByOrderId("tok", 10);

        act.Should().Throw<NotFoundException>();
    }

    [Fact]
    public void GetByOrderId_ShouldReturnData_WhenOwned()
    {
        var user = DefaultCustomer();
        var order = BuildOrder(1, OrderStatus.Processing, PaymentStatus.Paid);

        userRepoMock.Setup(x => x.GetByToken("tok")).Returns(user);
        orderRepoMock.Setup(x => x.GetById(10)).Returns(order);

        paymentRepoMock.Setup(x => x.GetByOrderId(10)).Returns(new[]
        {
            new Payment
            {
                Id = 1,
                OrderId = 10,
                Order = order,
                Method = "cod",
                Status = PaymentStatus.Paid,
                Amount = 1000,
                TransactionCode = "PAY-1"
            }
        });

        var result = service.GetByOrderId("tok", 10);

        result.Should().HaveCount(1);
    }

    [Fact]
    public void GetById_ShouldReturnNull_WhenNotOwned()
    {
        userRepoMock.Setup(x => x.GetByToken("tok")).Returns(DefaultCustomer());

        paymentRepoMock.Setup(x => x.GetById(1)).Returns(new Payment
        {
            Id = 1,
            OrderId = 10,
            Order = new Order { Id = 10, UserId = 999 }
        });

        var result = service.GetById("tok", 1);

        result.Should().BeNull();
    }

    [Fact]
    public void GetById_ShouldReturnPayment_WhenOwned()
    {
        userRepoMock.Setup(x => x.GetByToken("tok")).Returns(DefaultCustomer());

        var order = BuildOrder(1, OrderStatus.Processing, PaymentStatus.Paid);

        paymentRepoMock.Setup(x => x.GetById(1)).Returns(new Payment
        {
            Id = 1,
            OrderId = 10,
            Order = order,
            Method = "cod",
            Status = PaymentStatus.Paid,
            Amount = 1000
        });

        var result = service.GetById("tok", 1);

        result.Should().NotBeNull();
        result!.Method.Should().Be("cod");
    }

    [Fact]
    public void CreateVnPayPayment_ShouldThrow_WhenAlreadyPaid()
    {
        userRepoMock.Setup(x => x.GetByToken("tok")).Returns(DefaultCustomer());

        orderRepoMock.Setup(x => x.GetById(10)).Returns(BuildOrder(
            1,
            OrderStatus.Processing,
            PaymentStatus.Paid
        ));

        var act = () => service.CreateVnPayPayment("tok", new VnPayCreateUrlInput
        {
            OrderId = 10
        });

        act.Should().Throw<ConflictException>();
    }

    [Fact]
    public void CreateVnPayPayment_ShouldReturn_WhenPending()
    {
        userRepoMock.Setup(x => x.GetByToken("tok")).Returns(DefaultCustomer());

        orderRepoMock.Setup(x => x.GetById(10)).Returns(BuildOrder(
            1,
            OrderStatus.PendingPayment,
            PaymentStatus.Pending
        ));

        paymentRepoMock.Setup(x => x.GetByOrderId(10)).Returns(Array.Empty<Payment>());
        paymentRepoMock.Setup(x => x.Create(It.IsAny<Payment>()))
            .Returns<Payment>(p => p);

        var result = service.CreateVnPayPayment("tok", new VnPayCreateUrlInput
        {
            OrderId = 10
        });

        result.Should().NotBeNull();
        result.OrderNumber.Should().Be("ORD-10");
    }

    [Fact]
    public void Process_ShouldThrow_WhenOrderNotFound()
    {
        userRepoMock.Setup(x => x.GetByToken("tok")).Returns(DefaultCustomer());
        orderRepoMock.Setup(x => x.GetById(10)).Returns((Order?)null);

        var act = () => service.Process("tok", new PaymentProcessInput
        {
            OrderId = 10,
            Method = "cod"
        });

        act.Should().Throw<NotFoundException>();
    }

    [Fact]
    public void Process_ShouldReturnPayment_WhenValid()
    {
        userRepoMock.Setup(x => x.GetByToken("tok")).Returns(DefaultCustomer());

        var order = BuildOrder(1, OrderStatus.PendingPayment, PaymentStatus.Pending);

        orderRepoMock.Setup(x => x.GetById(10)).Returns(order);

        paymentRepoMock.Setup(x => x.Create(It.IsAny<Payment>()))
            .Returns<Payment>(p =>
            {
                p.Order = order;
                return p;
            });

        orderRepoMock.Setup(x => x.Update(It.IsAny<Order>()))
            .Returns<Order>(o => o);

        walletServiceMock
            .Setup(x => x.AddToAdminWallet(It.IsAny<decimal>(), It.IsAny<string>(), It.IsAny<string>()));

        var result = service.Process("tok", new PaymentProcessInput
        {
            OrderId = 10,
            Method = "cod"
        });

        result.Should().NotBeNull();
        result.Amount.Should().Be(1000);
        result.Method.Should().Be("cod");
    }
}