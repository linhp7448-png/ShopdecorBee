using System.ComponentModel.DataAnnotations;

namespace HomeDecorShop.Application;

public sealed class UpdateCartItemQuantityInput
{
    [Range(1, int.MaxValue)]
    public int Quantity { get; init; }
}
