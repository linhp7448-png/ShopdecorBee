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

    public CategoryServiceTests()
    {
        _service = new CategoryService(_repo.Object);
    }

    [Fact]
    public void GetAll_ShouldReturnCategories()
    {
        _repo.Setup(r => r.GetAll()).Returns(new[]
        {
            new Category { Id = 1, Name = "Decor", Slug = "decor", IsActive = true, GroupId = 1 }
        });

        _service.GetAll().Should().HaveCount(1);
    }

    [Fact]
    public void GetById_ShouldReturnNull_WhenNotFound()
    {
        _repo.Setup(r => r.GetById(999)).Returns((Category?)null);

        _service.GetById(999).Should().BeNull();
    }

    [Fact]
    public void Create_ShouldCreateCategory_WhenInputValid()
    {
        _repo.Setup(r => r.GetGroupById(1)).Returns(new CategoryGroup { Id = 1, IsActive = true, Name = "G", Slug = "g" });
        _repo.Setup(r => r.GetBySlug("new-cat")).Returns((Category?)null);
        _repo.Setup(r => r.GetAll()).Returns(Array.Empty<Category>());
        _repo.Setup(r => r.Create(It.IsAny<Category>())).Returns<Category>(c => c);

        var result = _service.Create(new CategoryUpsertInput
        {
            Name = "New Cat",
            Slug = "new-cat",
            GroupId = 1,
            IsActive = true
        });

        result.Name.Should().Be("New Cat");
    }

    [Fact]
    public void Update_ShouldReturnNull_WhenCategoryNotFound()
    {
        _repo.Setup(r => r.GetById(1)).Returns((Category?)null);

        _service.Update(1, new CategoryUpsertInput
        {
            Name = "X", Slug = "x", GroupId = 1, IsActive = true
        }).Should().BeNull();
    }

    [Fact]
    public void Delete_ShouldReturnHasProducts_WhenReferenced()
    {
        _repo.Setup(r => r.GetById(1)).Returns(new Category { Id = 1 });
        _repo.Setup(r => r.HasProducts(1)).Returns(true);

        _service.Delete(1).Should().Be(CategoryDeleteResult.HasProducts);
    }

    [Fact]
    public void Delete_ShouldReturnDeleted_WhenNoProducts()
    {
        _repo.Setup(r => r.GetById(1)).Returns(new Category { Id = 1 });
        _repo.Setup(r => r.HasProducts(1)).Returns(false);
        _repo.Setup(r => r.Delete(1)).Returns(true);

        _service.Delete(1).Should().Be(CategoryDeleteResult.Deleted);
    }

    [Fact]
    public void Delete_ShouldReturnNotFound_WhenCategoryNotExists()
    {
        _repo.Setup(r => r.GetById(999)).Returns((Category?)null);

        _service.Delete(999).Should().Be(CategoryDeleteResult.NotFound);
    }

    [Fact]
    public void Update_ShouldReturnCategory_WhenValid()
    {
        _repo.Setup(r => r.GetById(1)).Returns(new Category { Id = 1, Name = "Old", Slug = "old", GroupId = 1, IsActive = true });
        _repo.Setup(r => r.GetGroupById(1)).Returns(new CategoryGroup { Id = 1, IsActive = true, Name = "G", Slug = "g" });
        _repo.Setup(r => r.GetAll()).Returns(Array.Empty<Category>());
        _repo.Setup(r => r.Update(It.IsAny<Category>())).Returns<Category>(c => c);

        var result = _service.Update(1, new CategoryUpsertInput
        {
            Name = "Updated",
            Slug = "updated",
            GroupId = 1,
            IsActive = true
        });

        result.Should().NotBeNull();
        result!.Name.Should().Be("Updated");
    }

    [Fact]
    public void Create_ShouldThrowConflict_WhenSlugExists()
    {
        _repo.Setup(r => r.GetGroupById(1)).Returns(new CategoryGroup { Id = 1, IsActive = true, Name = "G", Slug = "g" });
        _repo.Setup(r => r.GetBySlug("existing-slug")).Returns(new Category { Id = 99, Slug = "existing-slug" });
        _repo.Setup(r => r.GetAll()).Returns(new List<Category>());

        var act = () => _service.Create(new CategoryUpsertInput
        {
            Name = "New",
            Slug = "existing-slug",
            GroupId = 1,
            IsActive = true
        });

        act.Should().Throw<ConflictException>();
    }
}
