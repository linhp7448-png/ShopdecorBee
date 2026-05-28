using System.ComponentModel.DataAnnotations;

namespace HomeDecorShop.Application;

public sealed class UpsertAddressInput
{
    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string FullName { get; init; } = string.Empty;

    [Required]
    [StringLength(20, MinimumLength = 8)]
    public string Phone { get; init; } = string.Empty;

    [Required]
    [StringLength(200, MinimumLength = 3)]
    public string Line1 { get; init; } = string.Empty;

    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string Ward { get; init; } = string.Empty;

    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string District { get; init; } = string.Empty;

    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string City { get; init; } = string.Empty;

    public bool IsDefault { get; init; }
}
