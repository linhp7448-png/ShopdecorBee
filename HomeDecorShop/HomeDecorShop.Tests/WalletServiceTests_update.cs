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
        _service = new WalletService(_walletRepo.Object, _orderRepo.Object, _paymentRepo.Object, _userRepo.Object);
    }

    private static User CreateCustomer(string token = "tok") => new()
    {
        UserId = 1,
        CurrentToken = token,
        Role = UserRole.Customer
    };

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
        _walletRepo.Setup(r => r.GetByUserId(1)).Returns(new Wallet { Id = 1, UserId = 1, Balance = 500000 });

        var act = () => _service.Withdraw("tok", invalidAmount);

        act.Should().Throw<RequestValidationException>();
    }

    [Fact]
    public void Withdraw_ShouldThrow_WhenAmountExceedsBalance()
    {
        _userRepo.Setup(r => r.GetByToken("tok")).Returns(CreateCustomer("tok"));
        _walletRepo.Setup(r => r.GetByUserId(1)).Returns(new Wallet { Id = 1, UserId = 1, Balance = 500000 });

        var act = () => _service.Withdraw("tok", 500001);

        act.Should().Throw<ConflictException>();
    }

    [Theory]
    [InlineData(1)]
    [InlineData(250000)]
    [InlineData(500000)]
    public void Withdraw_ShouldDeductBalance_WhenAmountIsValid(decimal validAmount)
    {
        _userRepo.Setup(r => r.GetByToken("tok")).Returns(CreateCustomer("tok"));
        var wallet = new Wallet { Id = 1, UserId = 1, Balance = 500000 };
        _walletRepo.Setup(r => r.GetByUserId(1)).Returns(wallet);
        _walletRepo.Setup(r => r.Update(It.IsAny<Wallet>())).Returns<Wallet>(w => w);
        _walletRepo.Setup(r => r.CreateTransaction(It.IsAny<WalletTransaction>()));

        var result = _service.Withdraw("tok", validAmount);

        result.Balance.Should().Be(500000 - validAmount);
        _walletRepo.Verify(r => r.Update(It.IsAny<Wallet>()), Times.Once);
        _walletRepo.Verify(r => r.CreateTransaction(It.IsAny<WalletTransaction>()), Times.Once);
    }
}