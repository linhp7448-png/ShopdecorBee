using HomeDecorShop.Domain;

namespace HomeDecorShop.Application;

public interface ICategoryRepository
{
    IReadOnlyCollection<Category> GetAll();
    Category? GetById(int categoryId);
    Category? GetBySlug(string slug);
    CategoryGroup? GetGroupById(int groupId);
    Category Create(Category category);
    Category? Update(Category category);
    bool Delete(int categoryId);
    bool HasProducts(int categoryId);
    bool HasActiveProducts(int categoryId);
}
