namespace HomeDecorShop.Application;

public interface IOrderService
{
    IReadOnlyCollection<OrderView> GetMine(string token);
    IReadOnlyCollection<OrderView> GetAll(string token);
    OrderView? GetById(string token, int orderId);
    OrderView PlaceOrder(string token, PlaceOrderInput input);
    OrderView? Cancel(string token, int orderId);
    OrderView? UpdateStatus(string token, int orderId, string status);
    OrderView? RequestRefund(string token, int orderId, string? reason);
    OrderView? ProcessRefund(string token, int orderId, bool approve);
}
