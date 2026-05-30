using Xunit;
using Moq;
using FluentAssertions;
using HomeDecorShop.Application;
using HomeDecorShop.Domain;
using System;
using System.Collections.Generic;

namespace HomeDecorShop.Tests;

public class CartServiceTests
{
    private readonly Mock<ICartRepository> _mockCartRepo;
    private readonly Mock<IUserRepository> _mockUserRepo;
    private readonly Mock<IProductRepository> _mockProductRepo;
    private readonly CartService _cartService;

    public CartServiceTests()
    {
        _mockCartRepo = new Mock<ICartRepository>();
        _mockUserRepo = new Mock<IUserRepository>();
        _mockProductRepo = new Mock<IProductRepository>();

        _cartService = new CartService(
            _mockCartRepo.Object,
            _mockUserRepo.Object,
            _mockProductRepo.Object);
    }

    [Fact]
    public void AddItem_ShouldThrowUnauthorizedException_WhenTokenIsInvalid()
    {
        var token = "invalid_token";
        var input = new AddCartItemInput { ProductId = 1, Quantity = 2 };
        _mockUserRepo.Setup(repo => repo.GetByToken(token)).Returns((User)null);

        Action act = () => _cartService.AddItem(token, input);
        act.Should().Throw<UnauthorizedException>()
           .WithMessage("Authentication token is invalid or has expired.");
    }

    [Fact]
    public void AddItem_ShouldUpdateCart_WhenProductIsValidAndStockIsEnough()
    {
        var token = "valid_token";
        var input = new AddCartItemInput { ProductId = 100, Quantity = 2 };
        var user = new User { UserId = 1 };
        var product = new Product { ProductId = 100, Price = 50000, IsActive = true, StockLeft = 10 };
        var existingCart = new Cart { UserId = 1, Items = new List<CartItem>() };

        _mockUserRepo.Setup(repo => repo.GetByToken(token)).Returns(user);
        _mockProductRepo.Setup(repo => repo.GetById(input.ProductId)).Returns(product);
        _mockCartRepo.Setup(repo => repo.GetByUserId(user.UserId)).Returns(existingCart);
        _mockCartRepo.Setup(repo => repo.Update(It.IsAny<Cart>())).Returns(existingCart);

        var result = _cartService.AddItem(token, input);

        result.Should().NotBeNull();
        result.TotalQuantity.Should().Be(2);
        _mockCartRepo.Verify(repo => repo.Update(It.IsAny<Cart>()), Times.Once);
    }

    [Fact]
    public void AddItem_ShouldThrowConflictException_WhenQuantityExceedsStock()
    {
        var token = "valid_token";
        var input = new AddCartItemInput { ProductId = 100, Quantity = 5 };
        var user = new User { UserId = 1 };
        var product = new Product { ProductId = 100, IsActive = true, StockLeft = 3 };
        var cart = new Cart { UserId = 1, Items = new List<CartItem>() };

        _mockUserRepo.Setup(repo => repo.GetByToken(token)).Returns(user);
        _mockProductRepo.Setup(repo => repo.GetById(input.ProductId)).Returns(product);
        _mockCartRepo.Setup(repo => repo.GetByUserId(user.UserId)).Returns(cart);

        Action act = () => _cartService.AddItem(token, input);
        act.Should().Throw<ConflictException>()
           .WithMessage($"Selected quantity exceeds available stock for product 100.");
    }
    // TEST CASES CHO HÀM: GetCurrent
    [Fact]
    public void GetCurrent_ShouldCreateNewCart_WhenCartDoesNotExist()
    {
        // Arrange
        var token = "valid_token";
        var user = new User { UserId = 1 };
        
        _mockUserRepo.Setup(repo => repo.GetByToken(token)).Returns(user);
        _mockCartRepo.Setup(repo => repo.GetByUserId(user.UserId)).Returns((Cart)null); // Giả lập chưa có giỏ hàng
        
        // Mock hành vi tạo mới giỏ hàng
        var newCart = new Cart { UserId = 1, Items = new List<CartItem>() };
        _mockCartRepo.Setup(repo => repo.Create(It.IsAny<Cart>())).Returns(newCart);

        // Act
        var result = _cartService.GetCurrent(token);

        // Assert
        result.Should().NotBeNull();
        result.Items.Should().BeEmpty();
        _mockCartRepo.Verify(repo => repo.Create(It.IsAny<Cart>()), Times.Once); // Đảm bảo hàm Create đã được gọi
    }

    // TEST CASES CHO HÀM: UpdateItem
    [Fact]
    public void UpdateItem_ShouldThrowNotFound_WhenItemNotInCart()
    {
        // Arrange
        var token = "valid_token";
        var input = new UpdateCartItemQuantityInput { Quantity = 5 };
        var user = new User { UserId = 1 };
        var cart = new Cart { UserId = 1, Items = new List<CartItem>() }; // Giỏ hàng rỗng, không có item nào

        _mockUserRepo.Setup(repo => repo.GetByToken(token)).Returns(user);
        _mockCartRepo.Setup(repo => repo.GetByUserId(user.UserId)).Returns(cart);

        // Act
        Action act = () => _cartService.UpdateItem(token, 999, input); // Cố tình update item id = 999

        // Assert
        act.Should().Throw<NotFoundException>()
           .WithMessage("Cart item with id 999 was not found.");
    }

    [Fact]
    public void UpdateItem_ShouldUpdateQuantity_WhenValid()
    {
        // Arrange
        var token = "valid_token";
        var itemId = 10;
        var input = new UpdateCartItemQuantityInput { Quantity = 3 }; // Đổi số lượng thành 3
        var user = new User { UserId = 1 };
        
        var product = new Product { ProductId = 100, Price = 50000, IsActive = true, StockLeft = 10 };
        var cartItem = new CartItem { Id = itemId, ProductId = 100, Quantity = 1 };
        var cart = new Cart { UserId = 1, Items = new List<CartItem> { cartItem } };

        _mockUserRepo.Setup(repo => repo.GetByToken(token)).Returns(user);
        _mockCartRepo.Setup(repo => repo.GetByUserId(user.UserId)).Returns(cart);
        _mockProductRepo.Setup(repo => repo.GetById(cartItem.ProductId)).Returns(product);
        _mockCartRepo.Setup(repo => repo.Update(It.IsAny<Cart>())).Returns(cart);

        // Act
        var result = _cartService.UpdateItem(token, itemId, input);

        // Assert
        result.TotalQuantity.Should().Be(3); // Tổng số lượng phải cập nhật thành 3
        _mockCartRepo.Verify(repo => repo.Update(It.IsAny<Cart>()), Times.Once);
    }

    // TEST CASES CHO HÀM: RemoveItem & Clear
    [Fact]
    public void RemoveItem_ShouldReturnTrue_WhenItemIsRemoved()
    {
        // Arrange
        var token = "valid_token";
        var user = new User { UserId = 1 };
        var cartItem = new CartItem { Id = 5 };
        var cart = new Cart { UserId = 1, Items = new List<CartItem> { cartItem } }; // Giỏ có 1 món

        _mockUserRepo.Setup(repo => repo.GetByToken(token)).Returns(user);
        _mockCartRepo.Setup(repo => repo.GetByUserId(user.UserId)).Returns(cart);

        // Act
        var result = _cartService.RemoveItem(token, 5); // Xóa món số 5

        // Assert
        result.Should().BeTrue();
        cart.Items.Should().BeEmpty(); // Giỏ hàng phải trống trơn
        _mockCartRepo.Verify(repo => repo.Update(It.IsAny<Cart>()), Times.Once);
    }

    [Fact]
    public void Clear_ShouldEmptyCart_WhenCartExists()
    {
        // Arrange
        var token = "valid_token";
        var user = new User { UserId = 1 };
        var cart = new Cart { 
            UserId = 1, 
            Items = new List<CartItem> { new CartItem { Id = 1 }, new CartItem { Id = 2 } } 
        };

        _mockUserRepo.Setup(repo => repo.GetByToken(token)).Returns(user);
        _mockCartRepo.Setup(repo => repo.GetByUserId(user.UserId)).Returns(cart);

        // Act
        var result = _cartService.Clear(token);

        // Assert
        result.Should().BeTrue();
        cart.Items.Should().BeEmpty(); // Hàm Clear phải quét sạch list items
        _mockCartRepo.Verify(repo => repo.Update(It.IsAny<Cart>()), Times.Once);
    }
}