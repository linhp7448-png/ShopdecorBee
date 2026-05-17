using HomeDecorShop.Domain;

namespace HomeDecorShop.Application;

public interface ICartRepository
{
    Cart? GetByUserId(int userId);
    Cart Create(Cart cart);
    Cart Update(Cart cart);
}
