namespace HomeDecorShop.Application;

public sealed record CategoryView(
    int Id,
    string Name,
    string Slug,
    bool IsActive,
    CategoryGroupSummaryView? Group);
