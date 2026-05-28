namespace HomeDecorShop.Application;

public interface IDashboardService
{
    DashboardStatsView GetStats(string token);
}
