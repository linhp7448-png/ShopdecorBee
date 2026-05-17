using HomeDecorShop.Domain;

namespace HomeDecorShop.Application;

public interface IProductRepository
{
    IReadOnlyCollection<Product> GetAll();
    Product? GetById(int productId);
    Product? GetBySku(string sku);
    Product? GetBySlug(string slug);
    Product Create(Product product);
    Product? Update(Product product);
    bool Delete(int productId);
}
