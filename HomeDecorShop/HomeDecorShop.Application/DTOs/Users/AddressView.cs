namespace HomeDecorShop.Application;

public sealed record AddressView(
    int Id,
    string FullName,
    string Phone,
    string Line1,
    string Ward,
    string District,
    string City,
    bool IsDefault);
