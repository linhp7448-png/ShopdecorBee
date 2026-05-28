namespace HomeDecorShop.Application;

public interface IPaymentService
{
    IReadOnlyCollection<PaymentView> GetMine(string token);
    IReadOnlyCollection<PaymentView> GetByOrderId(string token, int orderId);
    PaymentView? GetById(string token, int paymentId);
    PaymentView Process(string token, PaymentProcessInput input);
    VnPayCreateUrlResult CreateVnPayPayment(string token, VnPayCreateUrlInput input);
    VnPayHandleCallbackResult HandleVnPayCallback(VnPayHandleCallbackInput input);
}
