import type { Category, Product } from '@/core/models';
import type { CategoryDto, ProductDto, ProductListResultDto } from './catalog.api.types';

export function mapCategoryDto(dto: CategoryDto): Category {
  return {
    id: dto.id,
    name: dto.name,
    slug: dto.slug,
    isActive: dto.isActive
  };
}

export function mapProductDto(dto: ProductDto): Product {
  return {
    id: dto.productId,
    sku: dto.sku,
    name: dto.productName,
    slug: dto.slug,
    price: dto.price,
    originalPrice: dto.oldPrice ?? undefined,
    categoryId: dto.categoryId,
    category: dto.category,
    image: dto.image,
    hoverImage: dto.hoverImage,
    videoUrl: dto.videoUrl ?? undefined,
    tag: dto.tag ?? undefined,
    soldPercentage: dto.soldPercentage ?? undefined,
    stockLeft: dto.stockLeft,
    rating: dto.rating,
    reviews: dto.reviews,
    brand: dto.brand,
    color: dto.color,
    material: dto.material,
    style: dto.style,
    inStock: dto.inStock,
    isActive: dto.isActive,
    createdAt: dto.createdAt
  };
}

export function mapProductListResultDto(dto: ProductListResultDto): Product[] {
  return dto.items.map(mapProductDto);
}
