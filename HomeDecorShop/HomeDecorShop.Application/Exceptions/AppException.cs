namespace HomeDecorShop.Application;

public abstract class AppException : Exception
{
    protected AppException(string message, int statusCode, string title, string code, string? type = null)
        : base(message)
    {
        StatusCode = statusCode;
        Title = title;
        Code = code;
        Type = type ?? $"https://httpstatuses.com/{statusCode}";
    }

    public int StatusCode { get; }

    public string Title { get; }

    public string Code { get; }

    public string Type { get; }
}
