using System.ComponentModel.DataAnnotations;

namespace HomeDecorShop.Application;

public sealed class UpdateUserRoleInput
{
    [Required]
    [RegularExpression("(?i)^(admin|customer)$")]
    public string Role { get; init; } = string.Empty;
}
