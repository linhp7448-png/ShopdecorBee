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

    private const string ValidToken = "test_valid_token";
    private const string InvalidToken = "test_invalid_token";

    [Fact]
    public void AddItem_WhenTokenIsInvalid_ShouldThrowUnauthorizedException()
    {
        // Arrange
        var request = new AddCartItemInput { ProductId = 5, Quantity = 1 };
        _userRepo.Setup(r => r.GetByToken(InvalidToken)).Returns((User)null);

        // Act
        Action action = () => _cartService.AddItem(InvalidToken, request);

        // Assert
        action.Should().Throw<UnauthorizedException>()
              .WithMessage("Authentication token is invalid or has expired.");
    }

    [Fact]
    public void AddItem_WhenProductExistsAndStockSufficient_ShouldUpdateCartSuccessfully()
    {
        // Arrange
        var request = new AddCartItemInput { ProductId = 200, Quantity = 3 };
        var existingUser = new User { UserId = 10 };
        var availableProduct = new Product { ProductId = 200, Price = 120000, IsActive = true, StockLeft = 15 };
        var userCart = new Cart { UserId = 10, Items = new List<CartItem>() };

        _userRepo.Setup(r => r.GetByToken(ValidToken)).Returns(existingUser);
        _productRepo.Setup(r => r.GetById(request.ProductId)).Returns(availableProduct);
        _cartRepo.Setup(r => r.GetByUserId(existingUser.UserId)).Returns(userCart);
        _cartRepo.Setup(r => r.Update(It.IsAny<Cart>())).Returns(userCart);

        // Act
        var updatedCart = _cartService.AddItem(ValidToken, request);

        // Assert
        updatedCart.Should().NotBeNull();
        updatedCart.TotalQuantity.Should().Be(3);
        _cartRepo.Verify(r => r.Update(It.IsAny<Cart>()), Times.Once);
    }

    [Fact]
    public void AddItem_WhenRequestedQuantityExceedsStock_ShouldThrowConflictException()
    {
        // Arrange
        var request = new AddCartItemInput { ProductId = 200, Quantity = 10 };
        var existingUser = new User { UserId = 10 };
        var limitedProduct = new Product { ProductId = 200, IsActive = true, StockLeft = 4 };
        var userCart = new Cart { UserId = 10, Items = new List<CartItem>() };

        _userRepo.Setup(r => r.GetByToken(ValidToken)).Returns(existingUser);
        _productRepo.Setup(r => r.GetById(request.ProductId)).Returns(limitedProduct);
        _cartRepo.Setup(r => r.GetByUserId(existingUser.UserId)).Returns(userCart);

        // Act
        Action action = () => _cartService.AddItem(ValidToken, request);

        // Assert
        action.Should().Throw<ConflictException>()
              .WithMessage("Selected quantity exceeds available stock for product 200.");
    }

    [Fact]
    public void GetCurrent_WhenNoCartExists_ShouldCreateAndReturnNewCart()
    {
        // Arrange
        var existingUser = new User { UserId = 10 };
        var freshCart = new Cart { UserId = 10, Items = new List<CartItem>() };

        _userRepo.Setup(r => r.GetByToken(ValidToken)).Returns(existingUser);
        _cartRepo.Setup(r => r.GetByUserId(existingUser.UserId)).Returns((Cart)null);
        _cartRepo.Setup(r => r.Create(It.IsAny<Cart>())).Returns(freshCart);

        // Act
        var result = _cartService.GetCurrent(ValidToken);

        // Assert
        result.Should().NotBeNull();
        result.Items.Should().BeEmpty();
        _cartRepo.Verify(r => r.Create(It.IsAny<Cart>()), Times.Once);
    }

    [Fact]
    public void UpdateItem_WhenCartItemDoesNotExist_ShouldThrowNotFoundException()
    {
        // Arrange
        var targetItemId = 777;
        var request = new UpdateCartItemQuantityInput { Quantity = 2 };
        var existingUser = new User { UserId = 10 };
        var emptyCart = new Cart { UserId = 10, Items = new List<CartItem>() };

        _userRepo.Setup(r => r.GetByToken(ValidToken)).Returns(existingUser);
        _cartRepo.Setup(r => r.GetByUserId(existingUser.UserId)).Returns(emptyCart);

        // Act
        Action action = () => _cartService.UpdateItem(ValidToken, targetItemId, request);

        // Assert
        action.Should().Throw<NotFoundException>()
              .WithMessage($"Cart item with id {targetItemId} was not found.");
    }

    [Fact]
    public void UpdateItem_WhenItemExistsAndQuantityIsValid_ShouldUpdateSuccessfully()
    {
        // Arrange
        var targetItemId = 20;
        var request = new UpdateCartItemQuantityInput { Quantity = 4 };
        var existingUser = new User { UserId = 10 };
        var existingProduct = new Product { ProductId = 300, Price = 75000, IsActive = true, StockLeft = 20 };
        var existingItem = new CartItem { Id = targetItemId, ProductId = 300, Quantity = 2 };
        var userCart = new Cart { UserId = 10, Items = new List<CartItem> { existingItem } };

        _userRepo.Setup(r => r.GetByToken(ValidToken)).Returns(existingUser);
        _cartRepo.Setup(r => r.GetByUserId(existingUser.UserId)).Returns(userCart);
        _productRepo.Setup(r => r.GetById(existingItem.ProductId)).Returns(existingProduct);
        _cartRepo.Setup(r => r.Update(It.IsAny<Cart>())).Returns(userCart);

        // Act
        var result = _cartService.UpdateItem(ValidToken, targetItemId, request);

        // Assert
        result.TotalQuantity.Should().Be(4);
        _cartRepo.Verify(r => r.Update(It.IsAny<Cart>()), Times.Once);
    }

    [Fact]
    public void RemoveItem_WhenItemExistsInCart_ShouldRemoveAndReturnTrue()
    {
        // Arrange
        var targetItemId = 8;
        var existingUser = new User { UserId = 10 };
        var itemToRemove = new CartItem { Id = targetItemId };
        var userCart = new Cart { UserId = 10, Items = new List<CartItem> { itemToRemove } };

        _userRepo.Setup(r => r.GetByToken(ValidToken)).Returns(existingUser);
        _cartRepo.Setup(r => r.GetByUserId(existingUser.UserId)).Returns(userCart);

        // Act
        var isRemoved = _cartService.RemoveItem(ValidToken, targetItemId);

        // Assert
        isRemoved.Should().BeTrue();
        userCart.Items.Should().BeEmpty();
        _cartRepo.Verify(r => r.Update(It.IsAny<Cart>()), Times.Once);
    }

    [Fact]
    public void Clear_WhenCartHasItems_ShouldRemoveAllItemsAndReturnTrue()
    {
        // Arrange
        var existingUser = new User { UserId = 10 };
        var userCart = new Cart
        {
            UserId = 10,
            Items = new List<CartItem>
            {
                new() { Id = 11 },
                new() { Id = 22 },
                new() { Id = 33 }
            }
        };

        _userRepo.Setup(r => r.GetByToken(ValidToken)).Returns(existingUser);
        _cartRepo.Setup(r => r.GetByUserId(existingUser.UserId)).Returns(userCart);

        // Act
        var isCleared = _cartService.Clear(ValidToken);

        // Assert
        isCleared.Should().BeTrue();
        userCart.Items.Should().BeEmpty();
        _cartRepo.Verify(r => r.Update(It.IsAny<Cart>()), Times.Once);
    }
}
