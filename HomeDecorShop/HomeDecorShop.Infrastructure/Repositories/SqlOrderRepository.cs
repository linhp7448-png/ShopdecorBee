using HomeDecorShop.Application;
using HomeDecorShop.Domain;
using Microsoft.EntityFrameworkCore;

namespace HomeDecorShop.Infrastructure;

public sealed class SqlOrderRepository(AppDbContext context) : IOrderRepository
{
    public IReadOnlyCollection<Order> GetByUserId(int userId)
    {
        return Query()
            .Where(order => order.UserId == userId)
            .OrderByDescending(order => order.CreatedAt)
            .ToList();
    }

    public IReadOnlyCollection<Order> GetAll()
    {
        return Query()
            .OrderByDescending(order => order.CreatedAt)
            .ToList();
    }

    public Order? GetById(int orderId)
    {
        return Query()
            .FirstOrDefault(order => order.Id == orderId);
    }

    public Order Create(Order order)
    {
        context.Orders.Add(order);
        context.SaveChanges();
        return GetById(order.Id) ?? order;
    }

    public Order Update(Order order)
    {
        context.Orders.Update(order);
        context.SaveChanges();
        return GetById(order.Id) ?? order;
    }

    private IQueryable<Order> Query()
    {
        return context.Orders
            .Include(order => order.Items)
            .Include(order => order.Payments);
    }
}
