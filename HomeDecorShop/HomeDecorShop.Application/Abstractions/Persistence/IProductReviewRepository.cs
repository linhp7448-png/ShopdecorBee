using System.Collections.Generic;
using HomeDecorShop.Domain;

namespace HomeDecorShop.Application;

public interface IProductReviewRepository
{
    IReadOnlyCollection<ProductReview> GetByProductId(int productId);
    ProductReview Create(ProductReview review);
    ProductReview? GetById(int id);
}
