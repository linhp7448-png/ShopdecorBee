using HomeDecorShop.Domain;

namespace HomeDecorShop.Application;

public interface IPaymentRepository
{
    IReadOnlyCollection<Payment> GetByUserId(int userId);
    IReadOnlyCollection<Payment> GetByOrderId(int orderId);
    Payment? GetById(int paymentId);
    Payment? GetByTransactionCode(string transactionCode);
    Payment Create(Payment payment);
    Payment Update(Payment payment);
}
