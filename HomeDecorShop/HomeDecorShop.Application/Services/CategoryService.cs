using HomeDecorShop.Domain;

namespace HomeDecorShop.Application;

public sealed class CategoryService(ICategoryRepository repository) : ICategoryService
{
    public IReadOnlyCollection<CategoryView> GetAll() =>
        repository.GetAll().Select(MapCategory).ToArray();

    public CategoryView? GetById(int categoryId)
    {
        var category = repository.GetById(categoryId);
        return category is null ? null : MapCategory(category);
    }

    public CategoryView Create(CategoryUpsertInput input)
    {
        var name = NormalizeName(input.Name);
        var slug = NormalizeSlug(input.Slug);
        var group = RequireActiveGroup(input.GroupId);
        EnsureUniqueName(name, null);
        EnsureUniqueSlug(slug, null);

        var created = repository.Create(new Category
        {
            Name = name,
            Slug = slug,
            GroupId = group.Id,
            IsActive = input.IsActive
        });

        return MapCategory(created);
    }

    public CategoryView? Update(int categoryId, CategoryUpsertInput input)
    {
        var category = repository.GetById(categoryId);
        if (category is null)
        {
            return null;
        }

        var name = NormalizeName(input.Name);
        var slug = NormalizeSlug(input.Slug);
        var group = RequireActiveGroup(input.GroupId);
        EnsureUniqueName(name, categoryId);
        EnsureUniqueSlug(slug, categoryId);
        EnsureCanDeactivate(category, input.IsActive);

        category.Name = name;
        category.Slug = slug;
        category.GroupId = group.Id;
        category.IsActive = input.IsActive;

        var updated = repository.Update(category);
        return updated is null ? null : MapCategory(updated);
    }

    public CategoryDeleteResult Delete(int categoryId)
    {
        if (repository.GetById(categoryId) is null)
        {
            return CategoryDeleteResult.NotFound;
        }

        if (repository.HasProducts(categoryId))
        {
            return CategoryDeleteResult.HasProducts;
        }

        return repository.Delete(categoryId)
            ? CategoryDeleteResult.Deleted
            : CategoryDeleteResult.NotFound;
    }

    private void EnsureUniqueSlug(string slug, int? excludedCategoryId)
    {
        var existing = repository.GetBySlug(slug);
        if (existing is not null && existing.Id != excludedCategoryId)
        {
            throw new ConflictException("Category slug is already in use.", AppErrorCodes.CategorySlugAlreadyExists);
        }
    }

    private void EnsureUniqueName(string name, int? excludedCategoryId)
    {
        var normalizedName = NormalizeLookup(name);
        var existing = repository.GetAll()
            .FirstOrDefault(category =>
                NormalizeLookup(category.Name) == normalizedName &&
                category.Id != excludedCategoryId);

        if (existing is not null)
        {
            throw new ConflictException("Category name is already in use.", AppErrorCodes.CategoryNameAlreadyExists);
        }
    }

    private void EnsureCanDeactivate(Category category, bool isActive)
    {
        if (category.IsActive && !isActive && repository.HasActiveProducts(category.Id))
        {
            throw new ConflictException("Category cannot be deactivated while it still has active products.", AppErrorCodes.CategoryHasActiveProducts);
        }
    }

    private CategoryGroup RequireActiveGroup(int groupId)
    {
        var group = repository.GetGroupById(groupId);
        if (group is null)
        {
            throw new ConflictException("Category group is invalid.", AppErrorCodes.CategoryGroupInvalid);
        }

        if (!group.IsActive)
        {
            throw new ConflictException("Category group is inactive and cannot be assigned.", AppErrorCodes.CategoryGroupInactive);
        }

        return group;
    }

    private static CategoryView MapCategory(Category category) =>
        new(
            category.Id,
            category.Name,
            category.Slug,
            category.IsActive,
            category.GroupNavigation is null
                ? null
                : new CategoryGroupSummaryView(
                    category.GroupNavigation.Id,
                    category.GroupNavigation.Name,
                    category.GroupNavigation.Slug,
                    category.GroupNavigation.IsActive,
                    category.GroupNavigation.DisplayOrder));

    private static string NormalizeName(string name) =>
        name.Trim();

    private static string NormalizeLookup(string value) =>
        value.Trim().ToLowerInvariant();

    private static string NormalizeSlug(string slug) =>
        slug.Trim().ToLowerInvariant();
}
