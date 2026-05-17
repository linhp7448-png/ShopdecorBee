namespace HomeDecorShop.Application;

public sealed record ProductListResult(
    IReadOnlyCollection<ProductView> Items,
    int Total,
    int Page,
    int PageSize,
    string SortBy);
