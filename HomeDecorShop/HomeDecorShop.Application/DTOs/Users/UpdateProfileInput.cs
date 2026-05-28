using System.ComponentModel.DataAnnotations;

namespace HomeDecorShop.Application;

public sealed class UpdateProfileInput
{
    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string FullName { get; init; } = string.Empty;

    [Required]
    [StringLength(20, MinimumLength = 8)]
    public string Phone { get; init; } = string.Empty;
}
