using FluentAssertions;
using HomeDecorShop.Application;
using HomeDecorShop.Domain;
using Moq;

namespace HomeDecorShop.Tests;

/// <summary>White-box: WalletService (GetOrCreate, Deposit, Withdraw, PayOrder, GetTransactions)</summary>
public class WalletServiceTests
{
    private readonly Mock<IWalletRepository> _wallets = new();
    private readonly Mock<IOrderRepository> _orders = new();
    private readonly Mock<IPaymentRepository> _payments = new();
    private readonly Mock<IUserRepository> _users = new();
    private readonly WalletService _service;

    public WalletServiceTests()
    {
        _service = new WalletService(_wallets.Object, _orders.Object, _payments.Object, _users.Object);
    }

    private static User Customer => new()
    {
        UserId = 1,
        CurrentToken = "tok",
        Role = UserRole.Customer
    };

    [Fact]
    public void GetOrCreate_ShouldReturnWallet_WhenExists()
    {
        _users.Setup(r => r.GetByToken("tok")).Returns(Customer);
        _wallets.Setup(r => r.GetByUserId(1)).Returns(new Wallet { Id = 1, UserId = 1, Balance = 1000 });

        var result = _service.GetOrCreate("tok");

        result.Balance.Should().Be(1000);
    }

    [Fact]
    public void Deposit_ShouldThrow_WhenAmountInvalid()
    {
        _users.Setup(r => r.GetByToken("tok")).Returns(Customer);

        var act = () => _service.Deposit("tok", 0);
        act.Should().Throw<RequestValidationException>();
    }

    [Fact]
    public void Deposit_ShouldIncreaseBalance()
    {
        _users.Setup(r => r.GetByToken("tok")).Returns(Customer);
        var wallet = new Wallet { Id = 1, UserId = 1, Balance = 1000 };
        _wallets.Setup(r => r.GetByUserId(1)).Returns(wallet);
        _wallets.Setup(r => r.Update(It.IsAny<Wallet>())).Returns<Wallet>(w => w);
        _wallets.Setup(r => r.CreateTransaction(It.IsAny<WalletTransaction>()));

        var result = _service.Deposit("tok", 5000);

        result.Balance.Should().Be(6000);
    }

    [Fact]
    public void Withdraw_ShouldThrow_WhenInsufficientBalance()
    {
        _users.Setup(r => r.GetByToken("tok")).Returns(Customer);
        _wallets.Setup(r => r.GetByUserId(1)).Returns(new Wallet { Id = 1, UserId = 1, Balance = 100 });

        var act = () => _service.Withdraw("tok", 5000);
        act.Should().Throw<ConflictException>();
    }

    [Fact]
    public void PayOrder_ShouldThrow_WhenInsufficientBalance()
    {
        _users.Setup(r => r.GetByToken("tok")).Returns(Customer);
        _wallets.Setup(r => r.GetByUserId(1)).Returns(new Wallet { Id = 1, UserId = 1, Balance = 100 });
        _orders.Setup(r => r.GetById(1)).Returns(new Order
        {
            Id = 1,
            UserId = 1,
            Status = OrderStatus.PendingPayment,
            PaymentStatus = PaymentStatus.Pending,
            TotalAmount = 50000,
            OrderNumber = "ORD-1"
        });

        var act = () => _service.PayOrder("tok", 1);
        act.Should().Throw<ConflictException>();
    }

    [Fact]
    public void GetTransactions_ShouldReturnArray()
    {
        _users.Setup(r => r.GetByToken("tok")).Returns(Customer);
        _wallets.Setup(r => r.GetByUserId(1)).Returns(new Wallet { Id = 1, UserId = 1, Balance = 0 });
        _wallets.Setup(r => r.GetTransactionsByWalletId(1)).Returns(Array.Empty<WalletTransaction>());

        _service.GetTransactions("tok").Should().NotBeNull();
    }

    [Fact]
    public void GetOrCreate_ShouldCreateWallet_WhenNotExists()
    {
        _users.Setup(r => r.GetByToken("tok")).Returns(Customer);
        _wallets.Setup(r => r.GetByUserId(1)).Returns((Wallet?)null);
        _wallets.Setup(r => r.Create(It.IsAny<Wallet>())).Returns<Wallet>(w => w);

        var result = _service.GetOrCreate("tok");

        result.Should().NotBeNull();
        result.Balance.Should().Be(0);
        _wallets.Verify(r => r.Create(It.IsAny<Wallet>()), Times.Once);
    }

    [Fact]
    public void Withdraw_ShouldDecreaseBalance_WhenSufficientBalance()
    {
        _users.Setup(r => r.GetByToken("tok")).Returns(Customer);
        var wallet = new Wallet { Id = 1, UserId = 1, Balance = 10000 };
        _wallets.Setup(r => r.GetByUserId(1)).Returns(wallet);
        _wallets.Setup(r => r.Update(It.IsAny<Wallet>())).Returns<Wallet>(w => w);
        _wallets.Setup(r => r.CreateTransaction(It.IsAny<WalletTransaction>()));

        var result = _service.Withdraw("tok", 5000);

        result.Balance.Should().Be(5000);
    }

    [Fact]
    public void PayOrder_ShouldDecreaseBalance_WhenSufficientBalance()
    {
        _users.Setup(r => r.GetByToken("tok")).Returns(Customer);
        _users.Setup(r => r.GetAdmins()).Returns(new List<User>());
        var wallet = new Wallet { Id = 1, UserId = 1, Balance = 100000 };
        _wallets.Setup(r => r.GetByUserId(1)).Returns(wallet);
        _wallets.Setup(r => r.Update(It.IsAny<Wallet>())).Returns<Wallet>(w => w);
        _wallets.Setup(r => r.CreateTransaction(It.IsAny<WalletTransaction>()));
        
        var order = new Order
        {
            Id = 1,
            UserId = 1,
            Status = OrderStatus.PendingPayment,
            PaymentStatus = PaymentStatus.Pending,
            TotalAmount = 50000,
            OrderNumber = "ORD-1"
        };
        _orders.Setup(r => r.GetById(1)).Returns(order);
        _payments.Setup(r => r.Create(It.IsAny<Payment>())).Returns<Payment>(p => p);
        _orders.Setup(r => r.Update(It.IsAny<Order>())).Returns<Order>(o => o);
        _wallets.Setup(r => r.GetById(It.IsAny<int>())).Returns(wallet);

        var result = _service.PayOrder("tok", 1);

        result.Balance.Should().Be(50000);
        _wallets.Verify(r => r.CreateTransaction(It.IsAny<WalletTransaction>()), Times.Once);
    }
}

