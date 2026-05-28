using System;
using System.Linq;
using System.Collections.Generic;
using HomeDecorShop.Domain;

namespace HomeDecorShop.Application;

public sealed class DashboardService : IDashboardService
{
    private readonly IOrderRepository _orderRepository;
    private readonly IUserRepository _userRepository;

    public DashboardService(
        IOrderRepository orderRepository,
        IUserRepository userRepository)
    {
        _orderRepository = orderRepository;
        _userRepository = userRepository;
    }

    public DashboardStatsView GetStats(string token)
    {
        // Admin verification logic (assuming token validation is handled by middleware or UserService)
        var user = _userRepository.GetByToken(token);
        if (user == null || user.Role != UserRole.Admin)
        {
            throw new ForbiddenException("Bạn không có quyền truy cập thông tin này.");
        }

        var allOrders = _orderRepository.GetAll();
        var allUsers = _userRepository.GetAll();
        var now = DateTime.UtcNow;
        var today = now.Date;
        var startOfMonth = new DateTime(now.Year, now.Month, 1);
        var startOfLastWeek = today.AddDays(-7);
        var startOfTwoWeeksAgo = today.AddDays(-14);

        // 1. Total Revenue (all time for paid orders)
        var totalRevenue = allOrders
            .Where(o => o.PaymentStatus == PaymentStatus.Paid || o.Status == OrderStatus.Completed)
            .Sum(o => o.TotalAmount);

        // 2. Revenue Growth (this week vs last week)
        var revenueThisWeek = allOrders
            .Where(o => o.CreatedAt >= startOfLastWeek && (o.PaymentStatus == PaymentStatus.Paid || o.Status == OrderStatus.Completed))
            .Sum(o => o.TotalAmount);
        
        var revenueLastWeek = allOrders
            .Where(o => o.CreatedAt >= startOfTwoWeeksAgo && o.CreatedAt < startOfLastWeek && (o.PaymentStatus == PaymentStatus.Paid || o.Status == OrderStatus.Completed))
            .Sum(o => o.TotalAmount);

        double growth = 0;
        if (revenueLastWeek > 0)
        {
            growth = (double)((revenueThisWeek - revenueLastWeek) / revenueLastWeek) * 100;
        }
        else if (revenueThisWeek > 0)
        {
            growth = 100; // 100% growth if there was no revenue last week but some this week
        }

        // 3. New Orders Today
        var newOrdersToday = allOrders.Count(o => o.CreatedAt.Date == today);

        // 4. Pending Orders
        var pendingOrdersCount = allOrders.Count(o => o.Status == OrderStatus.PendingPayment);

        // 5. New Customers This Month
        var newCustomersMonth = allUsers.Count(u => u.CreatedAt >= startOfMonth && u.Role == UserRole.Customer);

        // 6. Revenue Chart (Last 7 days)
        var chartData = new List<ChartDataItem>();
        for (int i = 6; i >= 0; i--)
        {
            var date = today.AddDays(-i);
            var dayRevenue = allOrders
                .Where(o => o.CreatedAt.Date == date && (o.PaymentStatus == PaymentStatus.Paid || o.Status == OrderStatus.Completed))
                .Sum(o => o.TotalAmount);
            
            chartData.Add(new ChartDataItem(date.ToString("dd/MM"), dayRevenue));
        }

        return new DashboardStatsView(
            totalRevenue,
            Math.Round(growth, 1),
            newOrdersToday,
            pendingOrdersCount,
            newCustomersMonth,
            chartData
        );
    }
}
