namespace HomeDecorShop.Application;

public sealed class RequestValidationException : AppException
{
    public RequestValidationException(
        string message,
        IReadOnlyDictionary<string, string[]>? errors = null,
        string code = AppErrorCodes.ValidationFailed)
        : base(message, 400, "Validation failed", code)
    {
        Errors = errors ?? new Dictionary<string, string[]>(StringComparer.OrdinalIgnoreCase);
    }

    public IReadOnlyDictionary<string, string[]> Errors { get; }
}
