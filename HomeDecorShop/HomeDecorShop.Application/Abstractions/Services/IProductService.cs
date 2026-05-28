namespace HomeDecorShop.Application;

public interface IProductService
{
    ProductListResult Search(ProductQuery query);
    ProductView? GetById(int id);
    ProductView Create(ProductUpsertInput input);
    ProductView? Update(int id, ProductUpsertInput input);
    bool Delete(int id);
    IReadOnlyCollection<ProductReviewView> GetReviews(int productId);
    ProductReviewView AddReview(ProductReviewCreateInput input);
}
