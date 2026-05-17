namespace HomeDecorShop.Application;

public interface ICartService
{
    CartView GetCurrent(string token);
    CartView AddItem(string token, AddCartItemInput input);
    CartView UpdateItem(string token, int itemId, UpdateCartItemQuantityInput input);
    bool RemoveItem(string token, int itemId);
    bool Clear(string token);
}
