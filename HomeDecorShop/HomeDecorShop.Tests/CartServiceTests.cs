using Xunit;
using Moq;
using FluentAssertions;
using HomeDecorShop.Application;
using HomeDecorShop.Domain;
using System.Collections.Generic;

namespace HomeDecorShop.Tests;

public class CartServiceTests
{
    private readonly Mock<ICartRepository> _cartRepo = new();
    private readonly Mock<IUserRepository> _userRepo = new();
    private readonly Mock<IProductRepository> _productRepo = new();
    private readonly CartService _cartService;

    public CartServiceTests()
    {
        _cartService = new CartService(
            _cartRepo.Object,
            _userRepo.Object,
            _productRepo.Object);
    }

    private const string ValidToken = "valid_token";
    private const string InvalidToken = "invalid_token";

    [Fact]
    public void AddItem_ShouldThrowUnauthorizedException_WhenTokenIsInvalid()
    {
        // Arrange
        var input = new AddCartItemInput { ProductId = 1, Quantity = 2 };
        _userRepo.Setup(x => x.GetByToken(InvalidToken)).Returns((User)null);

        // Act
        Action act = () => _cartService.AddItem(InvalidToken, input);

        // Assert
        act.Should().Throw<UnauthorizedException>()
           .WithMessage("Authentication token is invalid or has expired.");
    }

    [Fact]
    public void AddItem_ShouldUpdateCart_WhenProductIsValidAndStockIsEnough()
    {
        // Arrange
        var input = new AddCartItemInput { ProductId = 100, Quantity = 2 };
        var user = new User { UserId = 1 };
        var product = new Product { ProductId = 100, Price = 50000, IsActive = true, StockLeft = 10 };
        var cart = new Cart { UserId = 1, Items = new List<CartItem>() };

        _userRepo.Setup(x => x.GetByToken(ValidToken)).Returns(user);
        _productRepo.Setup(x => x.GetById(input.ProductId)).Returns(product);
        _cartRepo.Setup(x => x.GetByUserId(user.UserId)).Returns(cart);
        _cartRepo.Setup(x => x.Update(It.IsAny<Cart>())).Returns(cart);

        // Act
        var result = _cartService.AddItem(ValidToken, input);

        // Assert
        result.Should().NotBeNull();
        result.TotalQuantity.Should().Be(2);
        _cartRepo.Verify(x => x.Update(It.IsAny<Cart>()), Times.Once);
    }

    [Fact]
    public void AddItem_ShouldThrowConflictException_WhenQuantityExceedsStock()
    {
        // Arrange
        var input = new AddCartItemInput { ProductId = 100, Quantity = 5 };
        var user = new User { UserId = 1 };
        var product = new Product { ProductId = 100, IsActive = true, StockLeft = 3 };
        var cart = new Cart { UserId = 1, Items = new List<CartItem>() };

        _userRepo.Setup(x => x.GetByToken(ValidToken)).Returns(user);
        _productRepo.Setup(x => x.GetById(input.ProductId)).Returns(product);
        _cartRepo.Setup(x => x.GetByUserId(user.UserId)).Returns(cart);

        // Act
        Action act = () => _cartService.AddItem(ValidToken, input);

        // Assert
        act.Should().Throw<ConflictException>()
           .WithMessage("Selected quantity exceeds available stock for product 100.");
    }

    [Fact]
    public void GetCurrent_ShouldCreateNewCart_WhenCartDoesNotExist()
    {
        // Arrange
        var user = new User { UserId = 1 };

        _userRepo.Setup(x => x.GetByToken(ValidToken)).Returns(user);
        _cartRepo.Setup(x => x.GetByUserId(user.UserId)).Returns((Cart)null);

        var newCart = new Cart { UserId = 1, Items = new List<CartItem>() };
        _cartRepo.Setup(x => x.Create(It.IsAny<Cart>())).Returns(newCart);

        // Act
        var result = _cartService.GetCurrent(ValidToken);

        // Assert
        result.Should().NotBeNull();
        result.Items.Should().BeEmpty();
        _cartRepo.Verify(x => x.Create(It.IsAny<Cart>()), Times.Once);
    }

    [Fact]
    public void UpdateItem_ShouldThrowNotFound_WhenItemNotInCart()
    {
        // Arrange
        var itemId = 999;
        var input = new UpdateCartItemQuantityInput { Quantity = 5 };
        var user = new User { UserId = 1 };
        var cart = new Cart { UserId = 1, Items = new List<CartItem>() };

        _userRepo.Setup(x => x.GetByToken(ValidToken)).Returns(user);
        _cartRepo.Setup(x => x.GetByUserId(user.UserId)).Returns(cart);

        // Act
        Action act = () => _cartService.UpdateItem(ValidToken, itemId, input);

        // Assert
        act.Should().Throw<NotFoundException>()
           .WithMessage($"Cart item with id {itemId} was not found.");
    }

    [Fact]
    public void UpdateItem_ShouldUpdateQuantity_WhenValid()
    {
        // Arrange
        var itemId = 10;
        var input = new UpdateCartItemQuantityInput { Quantity = 3 };
        var user = new User { UserId = 1 };

        var product = new Product { ProductId = 100, Price = 50000, IsActive = true, StockLeft = 10 };
        var cartItem = new CartItem { Id = itemId, ProductId = 100, Quantity = 1 };
        var cart = new Cart { UserId = 1, Items = new List<CartItem> { cartItem } };

        _userRepo.Setup(x => x.GetByToken(ValidToken)).Returns(user);
        _cartRepo.Setup(x => x.GetByUserId(user.UserId)).Returns(cart);
        _productRepo.Setup(x => x.GetById(cartItem.ProductId)).Returns(product);
        _cartRepo.Setup(x => x.Update(It.IsAny<Cart>())).Returns(cart);

        // Act
        var result = _cartService.UpdateItem(ValidToken, itemId, input);

        // Assert
        result.TotalQuantity.Should().Be(3);
        _cartRepo.Verify(x => x.Update(It.IsAny<Cart>()), Times.Once);
    }

    [Fact]
    public void RemoveItem_ShouldReturnTrue_WhenItemIsRemoved()
    {
        // Arrange
        var itemId = 5;
        var user = new User { UserId = 1 };
        var cartItem = new CartItem { Id = itemId };
        var cart = new Cart { UserId = 1, Items = new List<CartItem> { cartItem } };

        _userRepo.Setup(x => x.GetByToken(ValidToken)).Returns(user);
        _cartRepo.Setup(x => x.GetByUserId(user.UserId)).Returns(cart);

        // Act
        var result = _cartService.RemoveItem(ValidToken, itemId);

        // Assert
        result.Should().BeTrue();
        cart.Items.Should().BeEmpty();
        _cartRepo.Verify(x => x.Update(It.IsAny<Cart>()), Times.Once);
    }

    [Fact]
    public void Clear_ShouldEmptyCart_WhenCartExists()
    {
        // Arrange
        var user = new User { UserId = 1 };
        var cart = new Cart
        {
            UserId = 1,
            Items = new List<CartItem>
            {
                new() { Id = 1 },
                new() { Id = 2 }
            }
        };

        _userRepo.Setup(x => x.GetByToken(ValidToken)).Returns(user);
        _cartRepo.Setup(x => x.GetByUserId(user.UserId)).Returns(cart);

        // Act
        var result = _cartService.Clear(ValidToken);

        // Assert
        result.Should().BeTrue();
        cart.Items.Should().BeEmpty();
        _cartRepo.Verify(x => x.Update(It.IsAny<Cart>()), Times.Once);
    }
}
