using System.ComponentModel.DataAnnotations;

namespace HomeDecorShop.Application;

public sealed class AddCartItemInput
{
    [Range(1, int.MaxValue)]
    public int ProductId { get; init; }

    [Range(1, int.MaxValue)]
    public int Quantity { get; init; } = 1;
}
