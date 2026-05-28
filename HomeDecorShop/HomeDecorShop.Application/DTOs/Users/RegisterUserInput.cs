using System.ComponentModel.DataAnnotations;

namespace HomeDecorShop.Application;

public sealed class RegisterUserInput
{
    [Required]
    [EmailAddress]
    [StringLength(256)]
    public string Email { get; init; } = string.Empty;

    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string FullName { get; init; } = string.Empty;

    [Required]
    [StringLength(20, MinimumLength = 8)]
    public string Phone { get; init; } = string.Empty;

    [Required]
    [StringLength(100, MinimumLength = 6)]
    public string Password { get; init; } = string.Empty;

    [Required]
    [RegularExpression("(?i)^customer$")]
    public string Role { get; init; } = "customer";
}
