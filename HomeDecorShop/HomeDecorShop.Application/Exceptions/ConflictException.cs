namespace HomeDecorShop.Application;

public sealed class ConflictException : AppException
{
    public ConflictException(string message, string code = AppErrorCodes.Conflict)
        : base(message, 409, "Conflict", code)
    {
    }
}
