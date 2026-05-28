using System.ComponentModel.DataAnnotations;

namespace HomeDecorShop.Application;

public sealed class VnPayCreateUrlInput
{
    [Range(1, int.MaxValue)]
    public int OrderId { get; init; }
}
