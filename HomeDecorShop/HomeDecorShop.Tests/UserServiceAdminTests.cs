using FluentAssertions;
using HomeDecorShop.Application;
using HomeDecorShop.Domain;
using Moq;

namespace HomeDecorShop.Tests;

/// <summary>Thanh vien 2: GetAll, GetById, UpdateRole, ToggleStatus, Delete</summary>
public class UserServiceAdminTests
{
    private readonly Mock<IUserRepository> _repo = new();
    private readonly UserService _service;

    public UserServiceAdminTests()
    {
        _service = new UserService(_repo.Object, new Mock<IEmailService>().Object);
    }

    [Fact]
    public void GetAll_ShouldReturnMappedUsers()
    {
        _repo.Setup(r => r.GetAll()).Returns(new[]
        {
            new User { UserId = 1, Email = "a@test.com", Role = UserRole.Customer, Addresses = new List<Address>() }
        });

        var result = _service.GetAll();

        result.Should().HaveCount(1);
        result.First().Email.Should().Be("a@test.com");
    }

    [Fact]
    public void GetById_ShouldReturnNull_WhenNotFound()
    {
        _repo.Setup(r => r.GetById(999)).Returns((User?)null);

        _service.GetById(999).Should().BeNull();
    }

    [Fact]
    public void GetById_ShouldReturnUser_WhenExists()
    {
        _repo.Setup(r => r.GetById(1)).Returns(new User
        {
            UserId = 1,
            Email = "a@test.com",
            Role = UserRole.Admin,
            Addresses = new List<Address>()
        });

        _service.GetById(1)!.Email.Should().Be("a@test.com");
    }

    [Fact]
    public void UpdateRole_ShouldReturnFalse_WhenUserNotFound()
    {
        _repo.Setup(r => r.GetById(1)).Returns((User?)null);

        _service.UpdateRole(1, UserRole.Admin).Should().BeFalse();
    }

    [Fact]
    public void UpdateRole_ShouldUpdateRole_WhenUserExists()
    {
        var user = new User { UserId = 1, Role = UserRole.Customer };
        _repo.Setup(r => r.GetById(1)).Returns(user);
        _repo.Setup(r => r.Update(It.IsAny<User>())).Returns(user);

        _service.UpdateRole(1, UserRole.Admin).Should().BeTrue();
        user.Role.Should().Be(UserRole.Admin);
    }

    [Fact]
    public void ToggleStatus_ShouldFlipIsActive()
    {
        var user = new User { UserId = 1, IsActive = true };
        _repo.Setup(r => r.GetById(1)).Returns(user);
        _repo.Setup(r => r.Update(It.IsAny<User>())).Returns(user);

        _service.ToggleStatus(1).Should().BeTrue();
        user.IsActive.Should().BeFalse();
    }

    [Fact]
    public void ToggleStatus_ShouldReturnFalse_WhenUserNotFound()
    {
        _repo.Setup(r => r.GetById(1)).Returns((User?)null);

        _service.ToggleStatus(1).Should().BeFalse();
    }

    [Fact]
    public void Delete_ShouldCallRepository()
    {
        _repo.Setup(r => r.Delete(5)).Returns(true);

        _service.Delete(5).Should().BeTrue();
        _repo.Verify(r => r.Delete(5), Times.Once);
    }
}
