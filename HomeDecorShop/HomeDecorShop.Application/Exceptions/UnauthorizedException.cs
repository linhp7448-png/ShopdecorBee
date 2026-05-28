namespace HomeDecorShop.Application;

public sealed class UnauthorizedException : AppException
{
    public UnauthorizedException(string message, string code = AppErrorCodes.Unauthorized)
        : base(message, 401, "Unauthorized", code)
    {
    }
}
