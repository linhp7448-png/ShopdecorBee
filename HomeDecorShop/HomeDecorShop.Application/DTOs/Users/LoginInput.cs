using System.ComponentModel.DataAnnotations;

namespace HomeDecorShop.Application;

public sealed class LoginInput
{
    [Required]
    [StringLength(256)]
    public string Email { get; init; } = string.Empty;

    [Required]
    [StringLength(100, MinimumLength = 6)]
    public string Password { get; init; } = string.Empty;
}
