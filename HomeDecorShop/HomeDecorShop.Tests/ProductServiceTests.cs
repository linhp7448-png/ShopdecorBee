using FluentAssertions;
using HomeDecorShop.Application;
using HomeDecorShop.Domain;
using Moq;

namespace HomeDecorShop.Tests;

/// <summary>
/// Refactored Unit Tests for ProductService
/// Focus: GetById, Search, Create, Update, Delete
/// </summary>
public class ProductServiceTests
{
    private readonly Mock<IProductRepository> _productRepoMock = new();
    private readonly Mock<ICategoryRepository> _categoryRepoMock = new();
    private readonly Mock<IProductReviewRepository> _reviewRepoMock = new();
    private readonly ProductService _productService;

    public ProductServiceTests()
    {
        _productService = new ProductService(
            _productRepoMock.Object, 
            _categoryRepoMock.Object, 
            _reviewRepoMock.Object);
    }

    [Fact]
    public void GetById_ReturnsNull_WhenProductDoesNotExist()
    {
        // Arrange
        const int nonExistentId = 8888;
        _productRepoMock.Setup(x => x.GetById(nonExistentId)).Returns((Product?)null);

        // Act
        var result = _productService.GetById(nonExistentId);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public void GetById_ReturnsExpectedProduct_WhenIdIsValid()
    {
        // Arrange
        var testProduct = new Product
        {
            ProductId = 10,
            Sku = "TABLE-001",
            ProductName = "Oak Dining Table",
            Slug = "oak-dining-table",
            Price = 2500000,
            CategoryId = 2,
            Category = "Furniture",
            Image = "/images/table.jpg",
            HoverImage = "/images/table-hover.jpg",
            Brand = "NordicDesign",
            Color = "Brown",
            Material = "Oak Wood",
            Style = "Scandinavian",
            StockLeft = 10,
            IsActive = true
        };
        _productRepoMock.Setup(x => x.GetById(10)).Returns(testProduct);

        // Act
        var result = _productService.GetById(10);

        // Assert
        result.Should().NotBeNull();
        result!.ProductName.Should().Be("Oak Dining Table");
        result.Sku.Should().Be("TABLE-001");
    }

    [Fact]
    public void Search_FiltersCorrectly_ByKeyword()
    {
        // Arrange
        var products = new List<Product>
        {
            new() { ProductId = 1, ProductName = "Modern Sofa", IsActive = true, Price = 1000, Sku = "S1", Category = "C1" },
            new() { ProductId = 2, ProductName = "Classic Lamp", IsActive = true, Price = 500, Sku = "L1", Category = "C1" }
        };
        _productRepoMock.Setup(x => x.GetAll()).Returns(products);

        var query = new ProductQuery(
            Query: "sofa", Category: null, Brand: null, Style: null,
            MinPrice: null, MaxPrice: null, InStockOnly: false, OnSaleOnly: false,
            RatingGte: null, SortBy: null, Page: 1, PageSize: 10, IncludeInactive: false);

        // Act
        var result = _productService.Search(query);

        // Assert
result.Items.Should().ContainSingle();
        result.Items.First().ProductName.Should().Contain("Sofa");
    }

    [Fact]
    public void Create_ThrowsConflictException_IfSkuAlreadyExists()
    {
        // Arrange
        var existingSku = "EXISTING-SKU";
        _categoryRepoMock.Setup(x => x.GetById(It.IsAny<int>())).Returns(new Category { Id = 1, Name = "Test" });
        _productRepoMock.Setup(x => x.GetBySku(existingSku)).Returns(new Product { ProductId = 50, Sku = existingSku });

        var input = new ProductUpsertInput
        {
            Sku = existingSku,
            Name = "New Item",
            Price = 100,
            CategoryId = 1
        };

        // Act
        Action action = () => _productService.Create(input);

        // Assert
        action.Should().Throw<ConflictException>().WithMessage("*exists*");
    }

    [Fact]
    public void Update_ReturnsNull_GivenInvalidProductId()
    {
        // Arrange
        _productRepoMock.Setup(x => x.GetById(It.IsAny<int>())).Returns((Product?)null);

        // Act
        var result = _productService.Update(99, new ProductUpsertInput { Sku = "NEW" });

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public void Delete_CallsRepository_WithCorrectId()
    {
        // Arrange
        _productRepoMock.Setup(x => x.Delete(55)).Returns(true);

        // Act
        var success = _productService.Delete(55);

        // Assert
        success.Should().BeTrue();
        _productRepoMock.Verify(x => x.Delete(55), Times.Once);
    }

    [Fact]
    public void Update_UpdatesAllFields_WhenDataIsValid()
    {
        // Arrange
        var originalProduct = new Product { ProductId = 1, ProductName = "Old Name", Price = 100, Sku = "OLD-SKU" };
        _productRepoMock.Setup(x => x.GetById(1)).Returns(originalProduct);
        _categoryRepoMock.Setup(x => x.GetById(It.IsAny<int>())).Returns(new Category { Id = 1, Name = "Decor" });
        _productRepoMock.Setup(x => x.Update(It.IsAny<Product>())).Returns<Product>(p => p);

        var updateInfo = new ProductUpsertInput
        {
            Name = "Premium Vase",
            Sku = "VASE-001",
            Price = 450000,
            CategoryId = 1,
            IsActive = true
        };

        // Act
        var result = _productService.Update(1, updateInfo);

        // Assert
        result.Should().NotBeNull();
        result!.ProductName.Should().Be("Premium Vase");
        result.Price.Should().Be(450000);
    }

    [Fact]
    public void Search_ReturnsEmpty_WhenPriceRangeMatchesNothing()
    {
        // Arrange
        var products = new List<Product>
        {
            new() { ProductId = 1, Price = 1000, ProductName = "Cheap", Sku = "C", IsActive = true },
            new() { ProductId = 2, Price = 9000, ProductName = "Expensive", Sku = "E", IsActive = true }
        };
        _productRepoMock.Setup(x => x.GetAll()).Returns(products);

        var query = new ProductQuery(
Query: null, Category: null, Brand: null, Style: null,
            MinPrice: 2000, MaxPrice: 5000, InStockOnly: false, OnSaleOnly: false,
            RatingGte: null, SortBy: null, Page: 1, PageSize: 10, IncludeInactive: false);

        // Act
        var result = _productService.Search(query);

        // Assert
        result.Items.Should().BeEmpty();
    }

    [Fact]
    public void Search_FiltersByStockStatus_WhenInStockOnlyIsTrue()
    {
        // Arrange
        var products = new List<Product>
        {
            new() { ProductId = 1, ProductName = "In Stock", StockLeft = 5, IsActive = true },
            new() { ProductId = 2, ProductName = "Sold Out", StockLeft = 0, InStock = false, IsActive = true }
        };
        _productRepoMock.Setup(x => x.GetAll()).Returns(products);

        var query = new ProductQuery(
            Query: null, Category: null, Brand: null, Style: null,
            MinPrice: null, MaxPrice: null, InStockOnly: true, OnSaleOnly: false,
            RatingGte: null, SortBy: null, Page: 1, PageSize: 10, IncludeInactive: false);

        // Act
        var result = _productService.Search(query);

        // Assert
        result.Items.Should().ContainSingle();
        result.Items.First().ProductName.Should().Be("In Stock");
    }

    [Fact]
    public void Search_SortsByPriceDescending_WhenRequested()
    {
        // Arrange
        var products = new List<Product>
        {
            new() { ProductId = 1, ProductName = "Low", Price = 100, IsActive = true },
            new() { ProductId = 2, ProductName = "High", Price = 999, IsActive = true }
        };
        _productRepoMock.Setup(x => x.GetAll()).Returns(products);

        var query = new ProductQuery(
            Query: null, Category: null, Brand: null, Style: null,
            MinPrice: null, MaxPrice: null, InStockOnly: false, OnSaleOnly: false,
            RatingGte: null, SortBy: "price-desc", Page: 1, PageSize: 10, IncludeInactive: false);

        // Act
        var result = _productService.Search(query);

        // Assert
        result.Items.First().Price.Should().Be(999);
        result.Items.Last().Price.Should().Be(100);
    }
}