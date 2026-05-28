namespace HomeDecorShop.Application;

public sealed record CategoryGroupSummaryView(
    int Id,
    string Name,
    string Slug,
    bool IsActive,
    int DisplayOrder);
