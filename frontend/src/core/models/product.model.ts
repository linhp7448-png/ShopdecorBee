export interface Product {
  id: number;
  sku: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  categoryId: number;
  category: string;
  image: string;
  hoverImage: string;
  videoUrl?: string;
  tag?: string;
  soldPercentage?: number;
  stockLeft?: number;
  rating?: number;
  reviews?: number;
  brand?: string;
  color?: string;
  material?: string;
  style?: string;
  inStock?: boolean;
  isActive: boolean;
  createdAt: string;
  description?: string;
}
