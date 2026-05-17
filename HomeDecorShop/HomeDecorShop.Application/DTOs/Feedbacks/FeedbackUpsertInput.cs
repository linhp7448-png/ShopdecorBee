using System.ComponentModel.DataAnnotations;

namespace HomeDecorShop.Application;

public sealed class FeedbackUpsertInput
{
    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string Name { get; init; } = string.Empty;

    [Required]
    [EmailAddress]
    [StringLength(256)]
    public string Email { get; init; } = string.Empty;

    [Required]
    [StringLength(2000, MinimumLength = 5)]
    public string Message { get; init; } = string.Empty;
}
