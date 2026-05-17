namespace HomeDecorShop.Application;

public sealed class NotFoundException : AppException
{
    public NotFoundException(string message, string code = AppErrorCodes.ResourceNotFound)
        : base(message, 404, "Resource not found", code)
    {
    }
}
