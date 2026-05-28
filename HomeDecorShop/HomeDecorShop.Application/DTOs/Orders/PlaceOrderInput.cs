using System.ComponentModel.DataAnnotations;

namespace HomeDecorShop.Application;

public sealed class PlaceOrderInput
{
    [Range(1, int.MaxValue)]
    public int? AddressId { get; init; }

    [StringLength(100, MinimumLength = 2)]
    public string? FullName { get; init; }

    [StringLength(20, MinimumLength = 8)]
    public string? Phone { get; init; }

    [StringLength(200, MinimumLength = 3)]
    public string? Line1 { get; init; }

    [StringLength(100, MinimumLength = 2)]
    public string? Ward { get; init; }

    [StringLength(100, MinimumLength = 2)]
    public string? District { get; init; }

    [StringLength(100, MinimumLength = 2)]
    public string? City { get; init; }

    [StringLength(500)]
    public string? Notes { get; init; }
}
