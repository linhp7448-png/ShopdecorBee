using HomeDecorShop.Application;
using HomeDecorShop.Domain;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;

namespace HomeDecorShop.Infrastructure;

public sealed class SqlProductReviewRepository(AppDbContext dbContext) : IProductReviewRepository
{
    public IReadOnlyCollection<ProductReview> GetByProductId(int productId)
    {
        return dbContext.ProductReviews
            .Where(r => r.ProductId == productId)
            .OrderByDescending(r => r.CreatedAt)
            .ToList();
    }

    public ProductReview Create(ProductReview review)
    {
        dbContext.ProductReviews.Add(review);
        dbContext.SaveChanges();
        return review;
    }

    public ProductReview? GetById(int id)
    {
        return dbContext.ProductReviews.Find(id);
    }
}
