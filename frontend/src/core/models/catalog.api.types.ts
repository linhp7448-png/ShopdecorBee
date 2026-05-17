export interface CategoryGroupSummaryDto {
  id: number;
  name: string;
  slug: string;
  isActive: boolean;
  displayOrder: number;
}

export interface CategoryViewDto {
  id: number;
  name: string;
  slug: string;
  isActive: boolean;
  group?: CategoryGroupSummaryDto;
}

export interface ProductCategoryViewDto {
  id: number;
  name: string;
  slug: string;
}

export interface ProductViewDto {
  productId: number;
  sku: string;
  productName: string;
  slug: string;
  price: number;
  oldPrice?: number;
  categoryId: number;
  category: string;
  image: string;
  hoverImage: string;
  videoUrl?: string;
  tag?: string;
  soldPercentage?: number;
  stockLeft: number;
  rating: number;
  reviews: number;
  brand: string;
  color: string;
  material: string;
  style: string;
  inStock: boolean;
  isActive: boolean;
  createdAt: string;
  description?: string;
  categoryNavigation?: ProductCategoryViewDto;
}

export interface ProductListResultDto {
  items: ProductViewDto[];
  total: number;
  page: number;
  pageSize: number;
  sortBy: string;
}
