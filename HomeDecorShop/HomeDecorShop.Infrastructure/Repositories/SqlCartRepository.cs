using HomeDecorShop.Application;
using HomeDecorShop.Domain;
using Microsoft.EntityFrameworkCore;

namespace HomeDecorShop.Infrastructure;

public sealed class SqlCartRepository(AppDbContext context) : ICartRepository
{
    public Cart? GetByUserId(int userId)
    {
        return Query()
            .FirstOrDefault(cart => cart.UserId == userId);
    }

    public Cart Create(Cart cart)
    {
        context.Carts.Add(cart);
        context.SaveChanges();
        return GetByUserId(cart.UserId) ?? cart;
    }

    public Cart Update(Cart cart)
    {
        context.Carts.Update(cart);
        context.SaveChanges();
        return GetByUserId(cart.UserId) ?? cart;
    }

    private IQueryable<Cart> Query()
    {
        return context.Carts
            .Include(cart => cart.Items)
                .ThenInclude(item => item.Product)
                    .ThenInclude(product => product.CategoryNavigation);
    }
}
