namespace HomeDecorShop.Application;

public sealed record ProductQuery(
    string? Query,
    string? Category,
    string? Brand,
    string? Style,
    decimal? MinPrice,
    decimal? MaxPrice,
    bool InStockOnly,
    bool OnSaleOnly,
    int? RatingGte,
    string? SortBy,
    int Page,
    int PageSize,
    bool IncludeInactive = false);
