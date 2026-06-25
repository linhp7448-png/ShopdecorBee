using FluentAssertions;
using HomeDecorShop.Application;
using HomeDecorShop.Domain;
using Moq;

namespace HomeDecorShop.Tests;

/// <summary>Thanh vien 5: GetAll, GetById, Create, Update, Delete</summary>
public class CategoryServiceTests
{
    private readonly Mock<ICategoryRepository> _repo = new();
    private readonly CategoryService _service;

    public  CategoryServiceTests()
    {
        _service = new CategoryService(_repo.Object);
    }

    [Fact]
    public void GetAll_ShouldReturnCategories()
    {
        
        _repo.Setup(r => r.GetAll()).Returns(new[]
        {
            new Category { Id = 10, Name = "Furniture", Slug = "furniture", IsActive = true, GroupId = 2 },
            new Category { Id = 11, Name = "Lighting", Slug = "lighting", IsActive = false, GroupId = 2 }
        });

        
        _service.GetAll().Should().HaveCount(2);
    }

    [Fact]
    public void GetById_ShouldReturnNull_WhenNotFound()
    {
        
        _repo.Setup(r => r.GetById(500)).Returns((Category?)null);

        _service.GetById(500).Should().BeNull();
    }

    [Fact]
    public void Create_ShouldCreateCategory_WhenInputValid()
    {
        
        _repo.Setup(r => r.GetGroupById(5)).Returns(new CategoryGroup { Id = 5, IsActive = true, Name = "Living Room", Slug = "living-room" });
        _repo.Setup(r => r.GetBySlug("sofa-luxury")).Returns((Category?)null);
        _repo.Setup(r => r.GetAll()).Returns(Array.Empty<Category>());
        _repo.Setup(r => r.Create(It.IsAny<Category>())).Returns<Category>(c => c);

        
        var result = _service.Create(new CategoryUpsertInput
        {
            Name = "Sofa Luxury",
            Slug = "sofa-luxury",
            GroupId = 5,
            IsActive = true
        });

        result.Name.Should().Be("Sofa Luxury");
    }

    [Fact]
    public void Update_ShouldReturnNull_WhenCategoryNotFound()
    {
       
        _repo.Setup(r => r.GetById(88)).Returns((Category?)null);

        _service.Update(88, new CategoryUpsertInput
        {
            Name = "Kitchen", Slug = "kitchen", GroupId = 3, IsActive = true
        }).Should().BeNull();
    }

    [Fact]
    public void Delete_ShouldReturnHasProducts_WhenReferenced()
    {
        
        _repo.Setup(r => r.GetById(25)).Returns(new Category { Id = 25 });
        _repo.Setup(r => r.HasProducts(25)).Returns(true);

        _service.Delete(25).Should().Be(CategoryDeleteResult.HasProducts);
    }

    [Fact]
    public void Delete_ShouldReturnDeleted_WhenNoProducts()
    {
        
        _repo.Setup(r => r.GetById(40)).Returns(new Category { Id = 40 });
        _repo.Setup(r => r.HasProducts(40)).Returns(false);
        _repo.Setup(r => r.Delete(40)).Returns(true);

        _service.Delete(40).Should().Be(CategoryDeleteResult.Deleted);
    }

    [Fact]
    public void Delete_ShouldReturnNotFound_WhenCategoryNotExists()
    {
        
        _repo.Setup(r => r.GetById(777)).Returns((Category?)null);

        _service.Delete(777).Should().Be(CategoryDeleteResult.NotFound);
    }

    [Fact]
    public void Update_ShouldReturnCategory_WhenValid()
    {
       
        _repo.Setup(r => r.GetById(15)).Returns(new Category { Id = 15, Name = "Old Table", Slug = "old-table", GroupId = 4, IsActive = true });
        _repo.Setup(r => r.GetGroupById(4)).Returns(new CategoryGroup { Id = 4, IsActive = true, Name = "Tables", Slug = "tables" });
        _repo.Setup(r => r.GetAll()).Returns(Array.Empty<Category>());
        _repo.Setup(r => r.Update(It.IsAny<Category>())).Returns<Category>(c => c);

        
        var result = _service.Update(15, new CategoryUpsertInput
        {
            Name = "Premium Dining Table",
            Slug = "premium-dining-table",
            GroupId = 4,
            IsActive = false 
        });

        result.Should().NotBeNull();
        result!.Name.Should().Be("Premium Dining Table");
    }

    [Fact]
    public void Create_ShouldThrowConflict_WhenSlugExists()
    {
        
        _repo.Setup(r => r.GetGroupById(9)).Returns(new CategoryGroup { Id = 9, IsActive = true, Name = "Beds", Slug = "beds" });
        _repo.Setup(r => r.GetBySlug("duplicate-slug-test")).Returns(new Category { Id = 100, Slug = "duplicate-slug-test" });
        _repo.Setup(r => r.GetAll()).Returns(new List<Category>());

        var act = () => _service.Create(new CategoryUpsertInput
        {
            Name = "New Bed",
            Slug = "duplicate-slug-test",
            GroupId = 9,
            IsActive = true
        });

        act.Should().Throw<ConflictException>();
    }
}
