import { Product } from './product.model';
import { ProductViewDto } from './catalog.api.types';

export function mapProductViewDtoToProduct(dto: ProductViewDto): Product {
  return {
    id: dto.productId,
    sku: dto.sku,
    name: dto.productName,
    slug: dto.slug,
    price: dto.price,
    originalPrice: dto.oldPrice,
    categoryId: dto.categoryId,
    category: dto.category,
    image: dto.image,
    hoverImage: dto.hoverImage,
    videoUrl: dto.videoUrl,
    tag: dto.tag,
    soldPercentage: dto.soldPercentage,
    stockLeft: dto.stockLeft,
    rating: dto.rating ? Math.max(4.5, dto.rating) : 4.5,
    reviews: dto.reviews,
    brand: dto.brand,
    color: dto.color,
    material: dto.material,
    style: dto.style,
    inStock: dto.inStock,
    isActive: dto.isActive,
    createdAt: dto.createdAt,
    description: dto.description
  };
}
