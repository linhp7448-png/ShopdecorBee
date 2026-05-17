export interface CategoryDto {
  id: number;
  name: string;
  slug: string;
  isActive: boolean;
}

export interface ProductCategoryDto {
  id: number;
  name: string;
  slug: string;
  isActive: boolean;
}

export interface ProductDto {
  productId: number;
  sku: string;
  productName: string;
  slug: string;
  price: number;
  oldPrice?: number | null;
  categoryId: number;
  category: string;
  image: string;
  hoverImage: string;
  videoUrl?: string | null;
  tag?: string | null;
  soldPercentage?: number | null;
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
  description?: string | null;
  categoryNavigation?: ProductCategoryDto | null;
}

export interface ProductListResultDto {
  items: ProductDto[];
  total: number;
  page: number;
  pageSize: number;
  sortBy: string;
}

export interface ProductQueryDto {
  query?: string;
  category?: string;
  brand?: string;
  style?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  onSaleOnly?: boolean;
  ratingGte?: number;
  sortBy?: string;
  page?: number;
  pageSize?: number;
}
