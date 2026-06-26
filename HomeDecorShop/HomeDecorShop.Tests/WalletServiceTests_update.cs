using FluentAssertions;
using HomeDecorShop.Application;
using HomeDecorShop.Domain;
using Moq;

namespace HomeDecorShop.Tests;

public class WalletServiceTestsUpdate
{
    private readonly Mock<IWalletRepository> _walletRepo = new();
    private readonly Mock<IOrderRepository> _orderRepo = new();
    private readonly Mock<IPaymentRepository> _paymentRepo = new();
    private readonly Mock<IUserRepository> _userRepo = new();
    private readonly WalletService _service;

    public WalletServiceTestsUpdate()
    {
        // PayOrder gọi AddToAdminWalletInternal → userRepository.GetAdmins()
        // Moq mặc định trả null nếu không setup → FirstOrDefault() ném ArgumentNullException
        _userRepo.Setup(r => r.GetAdmins()).Returns(new List<User>());

        _service = new WalletService(
            _walletRepo.Object,
            _orderRepo.Object,
            _paymentRepo.Object,
            _userRepo.Object);
    }

    private static User CreateCustomer(string token = "tok") => new()
    {
        UserId = 1,
        CurrentToken = token,
        Role = UserRole.Customer
    };

    private static Order CreatePendingOrder(
        int orderId = 101,
        int userId = 1,
        decimal totalAmount = 300_000) => new()
    {
        Id = orderId,
        UserId = userId,
        OrderNumber = $"ORD-{orderId}",
        Status = OrderStatus.PendingPayment,
        PaymentStatus = PaymentStatus.Pending,
        Subtotal = totalAmount,
        ShippingFee = 0,
        TotalAmount = totalAmount,
        FullName = "Nguyen Van A",
        Phone = "0901234567",
        Line1 = "123 Le Loi",
        Ward = "Ben Nghe",
        District = "Quan 1",
        City = "Ho Chi Minh",
        CreatedAt = DateTime.UtcNow,
        UpdatedAt = DateTime.UtcNow
    };

    private void SetupSuccessfulPayOrder(Wallet wallet, Order order)
    {
        _walletRepo.Setup(r => r.GetByUserId(wallet.UserId)).Returns(wallet);
        _walletRepo.Setup(r => r.Update(It.IsAny<Wallet>())).Returns<Wallet>(w => w);
        _walletRepo.Setup(r => r.CreateTransaction(It.IsAny<WalletTransaction>()));
        _orderRepo.Setup(r => r.GetById(order.Id)).Returns(order);
        _orderRepo.Setup(r => r.Update(It.IsAny<Order>())).Returns<Order>(o => o);
        _paymentRepo.Setup(r => r.Create(It.IsAny<Payment>())).Returns<Payment>(p => p);
    }

    [Fact]
    public void GetOrCreate_ShouldCreateNewWallet_WhenWalletDoesNotExist()
    {
        _userRepo.Setup(r => r.GetByToken("tok")).Returns(CreateCustomer("tok"));
        _walletRepo.Setup(r => r.GetByUserId(1)).Returns((Wallet?)null);
        _walletRepo.Setup(r => r.Create(It.IsAny<Wallet>())).Returns<Wallet>(w => w);

        var result = _service.GetOrCreate("tok");

        result.Should().NotBeNull();
        result.Balance.Should().Be(0);
        _walletRepo.Verify(r => r.Create(It.IsAny<Wallet>()), Times.Once);
    }

    [Fact]
    public void Deposit_ShouldIncreaseBalance_WhenAmountIsValid()
    {
        _userRepo.Setup(r => r.GetByToken("tok")).Returns(CreateCustomer("tok"));
        var wallet = new Wallet { Id = 1, UserId = 1, Balance = 1000 };
        _walletRepo.Setup(r => r.GetByUserId(1)).Returns(wallet);
        _walletRepo.Setup(r => r.Update(It.IsAny<Wallet>())).Returns<Wallet>(w => w);
        _walletRepo.Setup(r => r.CreateTransaction(It.IsAny<WalletTransaction>()));

        var result = _service.Deposit("tok", 5000);

        result.Balance.Should().Be(6000);
        _walletRepo.Verify(r => r.Update(It.IsAny<Wallet>()), Times.Once);
        _walletRepo.Verify(r => r.CreateTransaction(It.IsAny<WalletTransaction>()), Times.Once);
    }

    [Fact]
    public void Deposit_ShouldThrow_WhenAmountIsInvalid()
    {
        _userRepo.Setup(r => r.GetByToken("tok")).Returns(CreateCustomer("tok"));

        var act = () => _service.Deposit("tok", 0);

        act.Should().Throw<RequestValidationException>();
    }

    [Fact]
    public void Deposit_ShouldThrow_WhenTokenIsInvalid()
    {
        _userRepo.Setup(r => r.GetByToken("invalid_token")).Returns((User?)null);

        var act = () => _service.Deposit("invalid_token", 1000);

        act.Should().Throw<UnauthorizedException>();
    }

    [Fact]
    public void Withdraw_ShouldThrow_WhenTokenIsInvalid()
    {
        _userRepo.Setup(r => r.GetByToken("invalid_token")).Returns((User?)null);

        var act = () => _service.Withdraw("invalid_token", 10000);

        act.Should().Throw<UnauthorizedException>();
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-10)]
    public void Withdraw_ShouldThrow_WhenAmountIsInvalid(decimal invalidAmount)
    {
        _userRepo.Setup(r => r.GetByToken("tok")).Returns(CreateCustomer("tok"));
        _walletRepo.Setup(r => r.GetByUserId(1)).Returns(new Wallet { Id = 1, UserId = 1, Balance = 500_000 });

        var act = () => _service.Withdraw("tok", invalidAmount);

        act.Should().Throw<RequestValidationException>();
    }

    [Fact]
    public void Withdraw_ShouldThrow_WhenAmountExceedsBalance()
    {
        _userRepo.Setup(r => r.GetByToken("tok")).Returns(CreateCustomer("tok"));
        _walletRepo.Setup(r => r.GetByUserId(1)).Returns(new Wallet { Id = 1, UserId = 1, Balance = 500_000 });

        var act = () => _service.Withdraw("tok", 500_001);

        act.Should().Throw<ConflictException>();
    }

    [Theory]
    [InlineData(1)]
    [InlineData(250_000)]
    [InlineData(500_000)]
    public void Withdraw_ShouldDeductBalance_WhenAmountIsValid(decimal validAmount)
    {
        _userRepo.Setup(r => r.GetByToken("tok")).Returns(CreateCustomer("tok"));
        var wallet = new Wallet { Id = 1, UserId = 1, Balance = 500_000 };
        _walletRepo.Setup(r => r.GetByUserId(1)).Returns(wallet);
        _walletRepo.Setup(r => r.Update(It.IsAny<Wallet>())).Returns<Wallet>(w => w);
        _walletRepo.Setup(r => r.CreateTransaction(It.IsAny<WalletTransaction>()));

        var result = _service.Withdraw("tok", validAmount);

        result.Balance.Should().Be(500_000 - validAmount);
        _walletRepo.Verify(r => r.Update(It.IsAny<Wallet>()), Times.Once);
        _walletRepo.Verify(r => r.CreateTransaction(It.IsAny<WalletTransaction>()), Times.Once);
    }

    // ==========================================
    // 4. TEST HÀM PayOrder (Thanh toán đơn hàng)
    // ==========================================

    [Fact]
    public void PayOrder_ShouldThrow_WhenTokenIsInvalid()
    {
        _userRepo.Setup(r => r.GetByToken("invalid_token")).Returns((User?)null);

        var act = () => _service.PayOrder("invalid_token", 101);

        act.Should().Throw<UnauthorizedException>();
    }

    [Fact]
    public void PayOrder_ShouldThrow_WhenOrderIsCancelled()
    {
        _userRepo.Setup(r => r.GetByToken("tok")).Returns(CreateCustomer("tok"));
        _walletRepo.Setup(r => r.GetByUserId(1)).Returns(new Wallet { Id = 1, UserId = 1, Balance = 200_000 });

        var order = CreatePendingOrder(totalAmount: 100_000);
        order.Status = OrderStatus.Cancelled;
        _orderRepo.Setup(r => r.GetById(101)).Returns(order);

        var act = () => _service.PayOrder("tok", 101);

        act.Should().Throw<ConflictException>();
    }

    [Fact]
    public void PayOrder_ShouldThrow_WhenOrderAlreadyPaid()
    {
        _userRepo.Setup(r => r.GetByToken("tok")).Returns(CreateCustomer("tok"));
        _walletRepo.Setup(r => r.GetByUserId(1)).Returns(new Wallet { Id = 1, UserId = 1, Balance = 200_000 });

        var order = CreatePendingOrder(totalAmount: 100_000);
        order.PaymentStatus = PaymentStatus.Paid;
        _orderRepo.Setup(r => r.GetById(101)).Returns(order);

        var act = () => _service.PayOrder("tok", 101);

        act.Should().Throw<ConflictException>();
    }

    [Fact]
    public void PayOrder_ShouldThrow_WhenAmountExceedsBalance()
    {
        _userRepo.Setup(r => r.GetByToken("tok")).Returns(CreateCustomer("tok"));
        var wallet = new Wallet { Id = 1, UserId = 1, Balance = 200_000 };
        var order = CreatePendingOrder(totalAmount: 200_001);

        _walletRepo.Setup(r => r.GetByUserId(1)).Returns(wallet);
        _orderRepo.Setup(r => r.GetById(101)).Returns(order);

        var act = () => _service.PayOrder("tok", 101);

        act.Should().Throw<ConflictException>();
    }

    [Fact]
    public void PayOrder_ShouldDeductBalance_WhenSufficientFunds()
    {
        _userRepo.Setup(r => r.GetByToken("tok")).Returns(CreateCustomer("tok"));

        var wallet = new Wallet { Id = 1, UserId = 1, Balance = 1_000_000_000 };
        var order = CreatePendingOrder(totalAmount: 300_000);
        SetupSuccessfulPayOrder(wallet, order);

        var result = _service.PayOrder("tok", 101);

        result.Balance.Should().Be(1_000_000_000 - 300_000);
        _walletRepo.Verify(r => r.Update(It.IsAny<Wallet>()), Times.Once);
        _walletRepo.Verify(r => r.CreateTransaction(It.IsAny<WalletTransaction>()), Times.Once);
        _paymentRepo.Verify(r => r.Create(It.IsAny<Payment>()), Times.Once);
        _orderRepo.Verify(r => r.Update(It.IsAny<Order>()), Times.Once);
    }

    // ==========================================
    // 5. TEST HÀM GetTransactions (Lịch sử giao dịch)
    // ==========================================

    [Fact]
    public void GetTransactions_ShouldThrow_WhenTokenIsInvalid()
    {
        _userRepo.Setup(r => r.GetByToken("invalid_token")).Returns((User?)null);

        var act = () => _service.GetTransactions("invalid_token");

        act.Should().Throw<UnauthorizedException>();
    }

    [Fact]
    public void GetTransactions_ShouldReturnTransactionList_WhenTokenIsValid()
    {
        _userRepo.Setup(r => r.GetByToken("tok")).Returns(CreateCustomer("tok"));
        var wallet = new Wallet { Id = 99, UserId = 1 };
        _walletRepo.Setup(r => r.GetByUserId(1)).Returns(wallet);

        var mockTransactions = new List<WalletTransaction>
        {
            new() { Id = 1, Amount = +500_000 },
            new() { Id = 2, Amount = -100_000 }
        };
        _walletRepo.Setup(r => r.GetTransactionsByWalletId(99)).Returns(mockTransactions);

        var result = _service.GetTransactions("tok");

        result.Should().HaveCount(2);
    }
}