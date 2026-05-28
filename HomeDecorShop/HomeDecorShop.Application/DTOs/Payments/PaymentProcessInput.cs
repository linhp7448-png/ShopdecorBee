using System.ComponentModel.DataAnnotations;

namespace HomeDecorShop.Application;

public sealed class PaymentProcessInput
{
    [Range(1, int.MaxValue)]
    public int OrderId { get; init; }

    [Required]
    [RegularExpression("(?i)^(cod|bank_transfer|momo)$")]
    public string Method { get; init; } = string.Empty;
}
