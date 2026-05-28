using System.Collections.Generic;

namespace HomeDecorShop.Application;

public record DashboardStatsView(
    decimal TotalRevenue,
    double RevenueGrowthPercentage,
    int NewOrdersToday,
    int PendingOrdersCount,
    int NewCustomersMonth,
    IReadOnlyCollection<ChartDataItem> RevenueChart
);

public record ChartDataItem(
    string Date,
    decimal Revenue
);
