using HomeDecorShop.Application;
using HomeDecorShop.Domain;
using Microsoft.EntityFrameworkCore;

namespace HomeDecorShop.Infrastructure;

public sealed class SqlProductRepository : IProductRepository
{
    private readonly AppDbContext _context;

    public SqlProductRepository(AppDbContext context)
    {
        _context = context;
    }

    public IReadOnlyCollection<Product> GetAll()
    {
        return _context.Products
            .Include(product => product.CategoryNavigation)
            .ToList();
    }

    public Product? GetById(int productId)
    {
        return _context.Products
            .Include(product => product.CategoryNavigation)
            .FirstOrDefault(product => product.ProductId == productId);
    }

    public Product? GetBySku(string sku)
    {
        return _context.Products
            .FirstOrDefault(product => product.Sku.ToUpper() == sku);
    }

    public Product? GetBySlug(string slug)
    {
        return _context.Products
            .FirstOrDefault(product => product.Slug.ToLower() == slug);
    }

    public Product Create(Product product)
    {
        _context.Products.Add(product);
        _context.SaveChanges();
        return product;
    }

    public Product? Update(Product product)
    {
        _context.Products.Update(product);
        _context.SaveChanges();
        return product;
    }

    public bool Delete(int productId)
    {
        var product = GetById(productId);
        if (product is null)
        {
            return false;
        }

        _context.Products.Remove(product);
        _context.SaveChanges();
        return true;
    }
}
