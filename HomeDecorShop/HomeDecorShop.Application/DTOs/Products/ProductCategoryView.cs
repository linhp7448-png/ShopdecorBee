namespace HomeDecorShop.Application;

public sealed record ProductCategoryView(
    int Id,
    string Name,
    string Slug,
    bool IsActive);
