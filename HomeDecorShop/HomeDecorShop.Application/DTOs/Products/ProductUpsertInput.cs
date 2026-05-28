using System.ComponentModel.DataAnnotations;

namespace HomeDecorShop.Application;

public sealed class ProductUpsertInput
{
    [Required]
    [StringLength(50, MinimumLength = 2)]
    public string Sku { get; init; } = string.Empty;

    [Required]
    [StringLength(200, MinimumLength = 2)]
    public string Name { get; init; } = string.Empty;

    [Required]
    [StringLength(200, MinimumLength = 2)]
    public string Slug { get; init; } = string.Empty;

    [Range(typeof(decimal), "0", "79228162514264337593543950335")]
    public decimal Price { get; init; }

    [Range(typeof(decimal), "0", "79228162514264337593543950335")]
    public decimal? OriginalPrice { get; init; }

    [Range(1, int.MaxValue)]
    public int CategoryId { get; init; }

    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string Category { get; init; } = string.Empty;

    [Required]
    [StringLength(500, MinimumLength = 3)]
    public string Image { get; init; } = string.Empty;

    [Required]
    [StringLength(500, MinimumLength = 3)]
    public string HoverImage { get; init; } = string.Empty;

    [StringLength(500)]
    public string? VideoUrl { get; init; }

    [StringLength(50)]
    public string? Tag { get; init; }

    [Range(0, 100)]
    public int? SoldPercentage { get; init; }

    [Range(0, int.MaxValue)]
    public int StockLeft { get; init; }

    [Range(0d, 5d)]
    public double Rating { get; init; }

    [Range(0, int.MaxValue)]
    public int Reviews { get; init; }

    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string Brand { get; init; } = string.Empty;

    [Required]
    [StringLength(50, MinimumLength = 2)]
    public string Color { get; init; } = string.Empty;

    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string Material { get; init; } = string.Empty;

    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string Style { get; init; } = string.Empty;

    public bool InStock { get; init; }

    public bool IsActive { get; init; }
}
