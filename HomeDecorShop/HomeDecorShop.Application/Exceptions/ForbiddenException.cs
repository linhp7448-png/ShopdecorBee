namespace HomeDecorShop.Application;

public sealed class ForbiddenException : AppException
{
    public ForbiddenException(string message, string code = AppErrorCodes.Forbidden)
        : base(message, 403, "Forbidden", code)
    {
    }
}
