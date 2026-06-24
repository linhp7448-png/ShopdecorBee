using FluentAssertions;
using HomeDecorShop.Application;
using HomeDecorShop.Domain;
using Moq;

namespace HomeDecorShop.Tests;

/// <summary>Thanh vien 4: GetById, Search, Create, Update, Delete</summary>
public class ProductServiceTests
{
    private readonly Mock<IProductRepository> _products = new();
    private readonly Mock<ICategoryRepository> _categories = new();
    private readonly Mock<IProductReviewRepository> _reviews = new();
    private readonly ProductService _service;

    public ProductServiceTests()
    {
        _service = new ProductService(_products.Object, _categories.Object, _reviews.Object);
    }

    [Fact]
    public void GetById_ShouldReturnNull_WhenNotFound()
    {
        _products.Setup(r => r.GetById(999)).Returns((Product?)null);

        _service.GetById(999).Should().BeNull();
    }

    [Fact]
    public void GetById_ShouldReturnProduct_WhenExists()
    {
        _products.Setup(r => r.GetById(1)).Returns(new Product
        {
            ProductId = 1,
            Sku = "SKU1",
            ProductName = "Chair",
            Slug = "chair",
            Price = 100000,
            CategoryId = 1,
            Category = "Decor",
            Image = "/a.jpg",
            HoverImage = "/b.jpg",
            Brand = "Bee",
            Color = "White",
            Material = "Wood",
            Style = "Modern",
            StockLeft = 5,
            IsActive = true
        });

        _service.GetById(1)!.ProductName.Should().Be("Chair");
    }

    [Fact]
    public void Search_ShouldFilterByKeyword()
    {
        _products.Setup(r => r.GetAll()).Returns(new[]
        {
            new Product
            {
                ProductId = 1, Sku = "A", ProductName = "Bee Sofa", Slug = "bee-sofa", Price = 1,
                CategoryId = 1, Category = "C", Image = "/a.jpg", HoverImage = "/b.jpg",
                Brand = "B", Color = "W", Material = "M", Style = "S", IsActive = true, StockLeft = 1
            },
            new Product
            {
                ProductId = 2, Sku = "B", ProductName = "Table", Slug = "table", Price = 1,
                CategoryId = 1, Category = "C", Image = "/a.jpg", HoverImage = "/b.jpg",
                Brand = "B", Color = "W", Material = "M", Style = "S", IsActive = true, StockLeft = 1
            }
        });

        var result = _service.Search(new ProductQuery(
            Query: "bee", Category: null, Brand: null, Style: null,
            MinPrice: null, MaxPrice: null, InStockOnly: false, OnSaleOnly: false,
            RatingGte: null, SortBy: null, Page: 1, PageSize: 10, IncludeInactive: false));

        result.Items.Should().HaveCount(1);
        result.Items.First().ProductName.Should().Contain("Bee");
    }

    [Fact]
    public void Create_ShouldThrowConflict_WhenSkuExists()
    {
        _categories.Setup(r => r.GetById(1)).Returns(new Category { Id = 1, IsActive = true, Name = "Decor", Slug = "decor" });
        _products.Setup(r => r.GetBySku("SKU-DUP")).Returns(new Product { ProductId = 99 });

        var act = () => _service.Create(new ProductUpsertInput
        {
            Sku = "SKU-DUP",
            Name = "Dup",
            Slug = "dup",
            Price = 1000,
            CategoryId = 1,
            Category = "Decor",
            Image = "/a.jpg",
            HoverImage = "/b.jpg",
            Brand = "B",
            Color = "W",
            Material = "M",
            Style = "S",
            StockLeft = 1,
            IsActive = true
        });

        act.Should().Throw<ConflictException>();
    }

    [Fact]
    public void Update_ShouldReturnNull_WhenProductNotFound()
    {
        _products.Setup(r => r.GetById(999)).Returns((Product?)null);

        _service.Update(999, new ProductUpsertInput
        {
            Sku = "X", Name = "X", Slug = "x", Price = 1, CategoryId = 1, Category = "C",
            Image = "/a.jpg", HoverImage = "/b.jpg", Brand = "B", Color = "W", Material = "M", Style = "S"
        }).Should().BeNull();
    }

    [Fact]
    public void Delete_ShouldCallRepository()
    {
        _products.Setup(r => r.Delete(3)).Returns(true);

        _service.Delete(3).Should().BeTrue();
    }

    [Fact]
    public void Update_ShouldReturnProduct_WhenValid()
    {
        _categories.Setup(r => r.GetById(1)).Returns(new Category { Id = 1, IsActive = true, Name = "Decor", Slug = "decor" });
        var existing = new Product
        {
            ProductId = 1,
            Sku = "SKU1",
            ProductName = "Old Name",
            Slug = "old-slug",
            Price = 100000,
            CategoryId = 1,
            Category = "Decor",
            Image = "/a.jpg",
            HoverImage = "/b.jpg",
            Brand = "B",
            Color = "W",
            Material = "M",
            Style = "S",
            StockLeft = 5,
            IsActive = true
        };
        _products.Setup(r => r.GetById(1)).Returns(existing);
        _products.Setup(r => r.GetBySku("SKU-NEW")).Returns((Product?)null);
        _products.Setup(r => r.GetBySlug("new-slug")).Returns((Product?)null);
        _products.Setup(r => r.Update(It.IsAny<Product>())).Returns<Product>(p => p);
        _products.Setup(r => r.GetById(1)).Returns((int id) => existing);

        var result = _service.Update(1, new ProductUpsertInput
        {
            Sku = "SKU-NEW",
            Name = "New Name",
            Slug = "new-slug",
            Price = 150000,
            CategoryId = 1,
            Category = "Decor",
            Image = "/a.jpg",
            HoverImage = "/b.jpg",
            Brand = "B",
            Color = "W",
            Material = "M",
            Style = "S",
            StockLeft = 10,
            IsActive = true
        });

        result.Should().NotBeNull();
        result!.ProductName.Should().Be("New Name");
        result.Price.Should().Be(150000);
    }

    [Fact]
    public void Search_ShouldFilterByCategory()
    {
        _products.Setup(r => r.GetAll()).Returns(new[]
        {
            new Product
            {
                ProductId = 1, Sku = "A", ProductName = "Chair", Slug = "chair", Price = 1,
                CategoryId = 1, Category = "Decor", Image = "/a.jpg", HoverImage = "/b.jpg",
                Brand = "B", Color = "W", Material = "M", Style = "S", IsActive = true, StockLeft = 1
            },
            new Product
            {
                ProductId = 2, Sku = "B", ProductName = "Table", Slug = "table", Price = 1,
                CategoryId = 2, Category = "Furniture", Image = "/a.jpg", HoverImage = "/b.jpg",
                Brand = "B", Color = "W", Material = "M", Style = "S", IsActive = true, StockLeft = 1
            }
        });

        var result = _service.Search(new ProductQuery(
            Query: null, Category: "decor", Brand: null, Style: null,
            MinPrice: null, MaxPrice: null, InStockOnly: false, OnSaleOnly: false,
            RatingGte: null, SortBy: null, Page: 1, PageSize: 10, IncludeInactive: false));

        result.Items.Should().HaveCount(1);
        result.Items.First().Category.Should().Be("Decor");
    }

    [Fact]
    public void Search_ShouldFilterByPriceRange()
    {
        _products.Setup(r => r.GetAll()).Returns(new[]
        {
            new Product
            {
                ProductId = 1, Sku = "A", ProductName = "Cheap", Slug = "cheap", Price = 50000,
                CategoryId = 1, Category = "C", Image = "/a.jpg", HoverImage = "/b.jpg",
                Brand = "B", Color = "W", Material = "M", Style = "S", IsActive = true, StockLeft = 1
            },
            new Product
            {
                ProductId = 2, Sku = "B", ProductName = "Expensive", Slug = "expensive", Price = 500000,
                CategoryId = 1, Category = "C", Image = "/a.jpg", HoverImage = "/b.jpg",
                Brand = "B", Color = "W", Material = "M", Style = "S", IsActive = true, StockLeft = 1
            }
        });

        var result = _service.Search(new ProductQuery(
            Query: null, Category: null, Brand: null, Style: null,
            MinPrice: 100000, MaxPrice: 200000, InStockOnly: false, OnSaleOnly: false,
            RatingGte: null, SortBy: null, Page: 1, PageSize: 10, IncludeInactive: false));

        result.Items.Should().BeEmpty();
    }

    [Fact]
    public void Search_ShouldFilterByInStockOnly()
    {
        _products.Setup(r => r.GetAll()).Returns(new[]
        {
            new Product
            {
                ProductId = 1, Sku = "A", ProductName = "InStock", Slug = "instock", Price = 1,
                CategoryId = 1, Category = "C", Image = "/a.jpg", HoverImage = "/b.jpg",
                Brand = "B", Color = "W", Material = "M", Style = "S", IsActive = true, StockLeft = 5
            },
            new Product
            {
                ProductId = 2, Sku = "B", ProductName = "OutOfStock", Slug = "outofstock", Price = 1,
                CategoryId = 1, Category = "C", Image = "/a.jpg", HoverImage = "/b.jpg",
                Brand = "B", Color = "W", Material = "M", Style = "S", IsActive = true, StockLeft = 0, InStock = false
            }
        });

        var result = _service.Search(new ProductQuery(
            Query: null, Category: null, Brand: null, Style: null,
            MinPrice: null, MaxPrice: null, InStockOnly: true, OnSaleOnly: false,
            RatingGte: null, SortBy: null, Page: 1, PageSize: 10, IncludeInactive: false));

        result.Items.Should().HaveCount(1);
        result.Items.First().ProductName.Should().Be("InStock");
    }

    [Fact]
    public void Search_ShouldSortByPriceAsc()
    {
        _products.Setup(r => r.GetAll()).Returns(new[]
        {
            new Product
            {
                ProductId = 1, Sku = "A", ProductName = "Expensive", Slug = "exp", Price = 500000,
                CategoryId = 1, Category = "C", Image = "/a.jpg", HoverImage = "/b.jpg",
                Brand = "B", Color = "W", Material = "M", Style = "S", IsActive = true, StockLeft = 1
            },
            new Product
            {
                ProductId = 2, Sku = "B", ProductName = "Cheap", Slug = "cheap", Price = 50000,
                CategoryId = 1, Category = "C", Image = "/a.jpg", HoverImage = "/b.jpg",
                Brand = "B", Color = "W", Material = "M", Style = "S", IsActive = true, StockLeft = 1
            }
        });

        var result = _service.Search(new ProductQuery(
            Query: null, Category: null, Brand: null, Style: null,
            MinPrice: null, MaxPrice: null, InStockOnly: false, OnSaleOnly: false,
            RatingGte: null, SortBy: "price-asc", Page: 1, PageSize: 10, IncludeInactive: false));

        result.Items.Should().HaveCount(2);
        result.Items.ElementAt(0).Price.Should().Be(50000);
        result.Items.ElementAt(1).Price.Should().Be(500000);
    }
}
