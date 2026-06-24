using FluentAssertions;
using HomeDecorShop.Application;
using HomeDecorShop.Domain;
using Moq;

namespace HomeDecorShop.Tests;

/// <summary>Thanh vien 1: Register, Login, GetByToken, UpdateProfile, ConfirmEmail</summary>
public class UserServiceAuthTests
{
    private readonly Mock<IUserRepository> _repo = new();
    private readonly Mock<IEmailService> _email = new();
    private readonly UserService _service;

    public UserServiceAuthTests()
    {
        _service = new UserService(_repo.Object, _email.Object);
    }

    [Fact]
    public void Register_ShouldReturnAuthResult_WhenEmailIsNew()
    {
        _repo.Setup(r => r.GetByEmail("new@test.com")).Returns((User?)null);
        _repo.Setup(r => r.Create(It.IsAny<User>())).Returns<User>(u => u);

        var result = _service.Register(new RegisterUserInput
        {
            Email = "new@test.com",
            FullName = "Test User",
            Phone = "0901234567",
            Password = "Pass@123",
            Role = "customer"
        });

        result.Token.Should().NotBeNullOrWhiteSpace();
        result.User.Email.Should().Be("new@test.com");
    }

    [Fact]
    public void Register_ShouldThrowConflict_WhenEmailExists()
    {
        _repo.Setup(r => r.GetByEmail("exists@test.com")).Returns(new User { Email = "exists@test.com" });

        var act = () => _service.Register(new RegisterUserInput
        {
            Email = "exists@test.com",
            FullName = "Dup",
            Phone = "0901234567",
            Password = "Pass@123",
            Role = "customer"
        });

        act.Should().Throw<ConflictException>();
    }

    [Fact]
    public void Login_ShouldReturnNull_WhenPasswordWrong()
    {
        var user = new User
        {
            Email = "a@test.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Correct"),
            IsEmailConfirmed = true,
            IsActive = true
        };
        _repo.Setup(r => r.GetByEmail("a@test.com")).Returns(user);

        var result = _service.Login(new LoginInput { Email = "a@test.com", Password = "Wrong" });

        result.Should().BeNull();
    }

    [Fact]
    public void Login_ShouldReturnAuthResult_WhenCredentialsValid()
    {
        var user = new User
        {
            UserId = 1,
            Email = "a@test.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Pass@123"),
            IsEmailConfirmed = true,
            IsActive = true,
            Role = UserRole.Customer,
            Addresses = new List<Address>()
        };
        _repo.Setup(r => r.GetByEmail("a@test.com")).Returns(user);
        _repo.Setup(r => r.Update(It.IsAny<User>())).Returns(user);

        var result = _service.Login(new LoginInput { Email = "a@test.com", Password = "Pass@123" });

        result.Should().NotBeNull();
        result!.Token.Should().NotBeNullOrWhiteSpace();
    }

    [Fact]
    public void Login_ShouldThrow_WhenEmailNotConfirmed()
    {
        var user = new User
        {
            Email = "a@test.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Pass@123"),
            IsEmailConfirmed = false,
            IsActive = true
        };
        _repo.Setup(r => r.GetByEmail("a@test.com")).Returns(user);

        var act = () => _service.Login(new LoginInput { Email = "a@test.com", Password = "Pass@123" });

        act.Should().Throw<RequestValidationException>();
    }

    [Fact]
    public void GetByToken_ShouldReturnUser_WhenTokenValid()
    {
        var user = new User { UserId = 1, Email = "a@test.com", Role = UserRole.Customer, Addresses = new List<Address>() };
        _repo.Setup(r => r.GetByToken("tok")).Returns(user);

        var result = _service.GetByToken("tok");

        result.Should().NotBeNull();
        result!.Email.Should().Be("a@test.com");
    }

    [Fact]
    public void GetByToken_ShouldReturnNull_WhenTokenInvalid()
    {
        _repo.Setup(r => r.GetByToken("bad")).Returns((User?)null);

        _service.GetByToken("bad").Should().BeNull();
    }

    [Fact]
    public void UpdateProfile_ShouldUpdateNameAndPhone()
    {
        var user = new User
        {
            UserId = 1,
            Email = "a@test.com",
            FullName = "Old",
            Phone = "0901111111",
            Role = UserRole.Customer,
            Addresses = new List<Address>()
        };
        _repo.Setup(r => r.GetByToken("tok")).Returns(user);
        _repo.Setup(r => r.Update(It.IsAny<User>())).Returns<User>(u => u);

        var result = _service.UpdateProfile("tok", new UpdateProfileInput
        {
            FullName = "New Name",
            Phone = "0909999999"
        });

        result!.FullName.Should().Be("New Name");
        result.Phone.Should().Be("0909999999");
    }

    [Fact]
    public void ConfirmEmail_ShouldReturnFalse_WhenTokenEmpty()
    {
        _service.ConfirmEmail("").Should().BeFalse();
    }

    [Fact]
    public void ConfirmEmail_ShouldReturnTrue_WhenTokenValid()
    {
        var user = new User { EmailConfirmationToken = "verify123", IsEmailConfirmed = false };
        _repo.Setup(r => r.GetAll()).Returns(new[] { user });
        _repo.Setup(r => r.Update(It.IsAny<User>())).Returns(user);

        _service.ConfirmEmail("verify123").Should().BeTrue();
        user.IsEmailConfirmed.Should().BeTrue();
    }
}
