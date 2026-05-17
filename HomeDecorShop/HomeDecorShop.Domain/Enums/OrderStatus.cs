namespace HomeDecorShop.Domain;

public enum OrderStatus
{
    PendingPayment = 0,
    Processing = 1,
    Cancelled = 2,
    Completed = 3,
    RefundRequested = 4,
    Refunded = 5
}
