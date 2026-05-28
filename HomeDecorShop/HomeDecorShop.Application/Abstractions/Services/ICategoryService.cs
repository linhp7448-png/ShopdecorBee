namespace HomeDecorShop.Application;

public interface ICategoryService
{
    IReadOnlyCollection<CategoryView> GetAll();
    CategoryView? GetById(int categoryId);
    CategoryView Create(CategoryUpsertInput input);
    CategoryView? Update(int categoryId, CategoryUpsertInput input);
    CategoryDeleteResult Delete(int categoryId);
}
