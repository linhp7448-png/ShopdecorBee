namespace HomeDecorShop.Application;

public sealed record UserView(
    int Id,
    string Email,
    string FullName,
    string Phone,
    string Role,
    DateTime CreatedAt,
    bool IsActive,
    IReadOnlyCollection<AddressView> Addresses);
