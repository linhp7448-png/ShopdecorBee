using HomeDecorShop.Application;
using HomeDecorShop.Domain;
using Microsoft.EntityFrameworkCore;

namespace HomeDecorShop.Infrastructure;

public sealed class SqlCategoryRepository(AppDbContext context) : ICategoryRepository
{
    public IReadOnlyCollection<Category> GetAll() =>
        context.Categories
            .Include(category => category.GroupNavigation)
            .OrderBy(category => category.GroupNavigation.DisplayOrder)
            .ThenBy(category => category.Name)
            .ToList();

    public Category? GetById(int categoryId) =>
        context.Categories
            .Include(category => category.GroupNavigation)
            .FirstOrDefault(category => category.Id == categoryId);

    public Category? GetBySlug(string slug) =>
        context.Categories
            .Include(category => category.GroupNavigation)
            .FirstOrDefault(category => category.Slug == slug);

    public CategoryGroup? GetGroupById(int groupId) =>
        context.CategoryGroups.FirstOrDefault(group => group.Id == groupId);

    public Category Create(Category category)
    {
        context.Categories.Add(category);
        context.SaveChanges();
        return GetById(category.Id)!;
    }

    public Category? Update(Category category)
    {
        foreach (var product in context.Products.Where(product => product.CategoryId == category.Id))
        {
            product.Category = category.Name;
        }

        context.Categories.Update(category);
        context.SaveChanges();
        return GetById(category.Id);
    }

    public bool Delete(int categoryId)
    {
        var category = GetById(categoryId);
        if (category is null)
        {
            return false;
        }

        context.Categories.Remove(category);
        context.SaveChanges();
        return true;
    }

    public bool HasProducts(int categoryId) =>
        context.Products.Any(product => product.CategoryId == categoryId);

    public bool HasActiveProducts(int categoryId) =>
        context.Products.Any(product => product.CategoryId == categoryId && product.IsActive);
}
