using HomeDecorShop.Domain;

namespace HomeDecorShop.Application;

public sealed class CartService(
    ICartRepository cartRepository,
    IUserRepository userRepository,
    IProductRepository productRepository) : ICartService
{
    public CartView GetCurrent(string token)
    {
        var user = RequireUser(token);
        var cart = cartRepository.GetByUserId(user.UserId);

        if (cart is null)
        {
            cart = cartRepository.Create(new Cart
            {
                UserId = user.UserId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                Items = new List<CartItem>()
            });
        }

        return MapCart(cart);
    }

    public CartView AddItem(string token, AddCartItemInput input)
    {
        var user = RequireUser(token);
        var product = RequirePurchasableProduct(input.ProductId);
        var now = DateTime.UtcNow;
        var cart = cartRepository.GetByUserId(user.UserId);
        var isNewCart = cart is null;

        cart ??= new Cart
        {
            UserId = user.UserId,
            CreatedAt = now,
            UpdatedAt = now,
            Items = new List<CartItem>()
        };

        var existingItem = cart.Items.FirstOrDefault(item => item.ProductId == input.ProductId);
        var desiredQuantity = (existingItem?.Quantity ?? 0) + input.Quantity;
        EnsureStockAvailable(product, desiredQuantity);

        if (existingItem is null)
        {
            cart.Items.Add(new CartItem
            {
                ProductId = product.ProductId,
                Quantity = desiredQuantity,
                UnitPrice = product.Price,
                CreatedAt = now,
                UpdatedAt = now
            });
        }
        else
        {
            existingItem.Quantity = desiredQuantity;
            existingItem.UnitPrice = product.Price;
            existingItem.UpdatedAt = now;
        }

        cart.UpdatedAt = now;
        var saved = isNewCart ? cartRepository.Create(cart) : cartRepository.Update(cart);
        return MapCart(saved);
    }

    public CartView UpdateItem(string token, int itemId, UpdateCartItemQuantityInput input)
    {
        var user = RequireUser(token);
        var cart = cartRepository.GetByUserId(user.UserId)
            ?? throw CreateEmptyCartException();
        var item = cart.Items.FirstOrDefault(current => current.Id == itemId)
            ?? throw new NotFoundException($"Cart item with id {itemId} was not found.", AppErrorCodes.CartItemNotFound);
        var product = RequirePurchasableProduct(item.ProductId);

        EnsureStockAvailable(product, input.Quantity);

        item.Quantity = input.Quantity;
        item.UnitPrice = product.Price;
        item.UpdatedAt = DateTime.UtcNow;
        cart.UpdatedAt = DateTime.UtcNow;

        return MapCart(cartRepository.Update(cart));
    }

    public bool RemoveItem(string token, int itemId)
    {
        var user = RequireUser(token);
        var cart = cartRepository.GetByUserId(user.UserId);
        if (cart is null)
        {
            return false;
        }

        var item = cart.Items.FirstOrDefault(current => current.Id == itemId);
        if (item is null)
        {
            return false;
        }

        cart.Items.Remove(item);
        cart.UpdatedAt = DateTime.UtcNow;
        _ = cartRepository.Update(cart);
        return true;
    }

    public bool Clear(string token)
    {
        var user = RequireUser(token);
        var cart = cartRepository.GetByUserId(user.UserId);
        if (cart is null)
        {
            return true;
        }

        cart.Items.Clear();
        cart.UpdatedAt = DateTime.UtcNow;
        _ = cartRepository.Update(cart);
        return true;
    }

    private User RequireUser(string token) =>
        userRepository.GetByToken(token.Trim())
        ?? throw new UnauthorizedException("Authentication token is invalid or has expired.", AppErrorCodes.AuthTokenInvalid);

    private Product RequirePurchasableProduct(int productId)
    {
        var product = productRepository.GetById(productId)
            ?? throw new NotFoundException($"Product with id {productId} was not found.", AppErrorCodes.ProductNotFound);

        if (!product.IsActive || product.CategoryNavigation is { IsActive: false })
        {
            throw new ConflictException("Selected product is inactive and cannot be added to cart.", AppErrorCodes.ProductInactive);
        }

        if (GetAvailableStock(product) <= 0)
        {
            throw new ConflictException("Selected product is out of stock.", AppErrorCodes.ProductOutOfStock);
        }

        return product;
    }

    private static void EnsureStockAvailable(Product product, int desiredQuantity)
    {
        var availableStock = GetAvailableStock(product);
        if (desiredQuantity <= availableStock)
        {
            return;
        }

        throw new ConflictException($"Selected quantity exceeds available stock for product {product.ProductId}.", AppErrorCodes.ProductStockExceeded);
    }

    private static int GetAvailableStock(Product product)
    {
        if (product.StockLeft > 0)
        {
            return product.StockLeft;
        }

        return product.InStock ? 999 : 0;
    }

    private static CartView MapCart(Cart cart)
    {
        var items = cart.Items
            .OrderBy(item => item.Id)
            .Select(item =>
            {
                var product = item.Product;
                var availableStock = product is null ? 0 : GetAvailableStock(product);
                var isAvailable = product is not null &&
                    product.IsActive &&
                    (product.CategoryNavigation?.IsActive ?? true) &&
                    availableStock > 0;

                return new CartItemView(
                    item.Id,
                    item.ProductId,
                    product?.ProductName ?? string.Empty,
                    product?.Sku ?? string.Empty,
                    product?.Image ?? string.Empty,
                    item.UnitPrice,
                    item.Quantity,
                    item.UnitPrice * item.Quantity,
                    availableStock,
                    isAvailable);
            })
            .ToArray();

        return new CartView(
            cart.Id,
            cart.UserId,
            items,
            items.Sum(item => item.Quantity),
            items.Sum(item => item.LineTotal),
            cart.CreatedAt,
            cart.UpdatedAt);
    }

    private static RequestValidationException CreateEmptyCartException() =>
        new(
            "Cart is empty.",
            new Dictionary<string, string[]>
            {
                ["cart"] = ["Cart does not contain any items."]
            },
            AppErrorCodes.CartEmpty);
}
