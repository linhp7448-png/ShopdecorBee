import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, catchError, of } from 'rxjs';
import { Product } from '../models';
import {
  MOCK_CATEGORIES,
  MOCK_CATEGORY_PRODUCTS,
  MOCK_NEW_COLLECTION_PRODUCTS,
  MOCK_TRENDING_PRODUCTS,
  MOCK_FLASH_SALE_PRODUCTS,
  MOCK_NEW_ARRIVALS_PRODUCTS
} from '../mock-data/ecommerce.mock';

const ALL_MOCK_PRODUCTS: Product[] = [
  ...MOCK_CATEGORY_PRODUCTS,
  ...MOCK_NEW_COLLECTION_PRODUCTS,
  ...MOCK_TRENDING_PRODUCTS,
  ...MOCK_FLASH_SALE_PRODUCTS,
  ...MOCK_NEW_ARRIVALS_PRODUCTS
];

// Kiểu dữ liệu Backend trả về (camelCase từ C# PascalCase)
interface BackendProduct {
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

// Dữ liệu mẫu hiển thị khi Backend chưa chạy
const FALLBACK_FLASH_SALE: Product[] = [
  {
    id: 101, sku: 'BEE-101', name: 'Khay Cắm Bút Gỗ Sồi', slug: 'khay-cam-but-go-soi',
    price: 150000, originalPrice: 180000,
    categoryId: 1, category: 'Phụ kiện bàn',
    image: 'https://picsum.photos/id/101/400/500', hoverImage: 'https://picsum.photos/id/102/400/500',
    tag: 'SALE', soldPercentage: 72, stockLeft: 8,
    rating: 4.8, reviews: 45, brand: 'BeeShop',
    inStock: true, isActive: true, createdAt: new Date().toISOString()
  },
  {
    id: 111, sku: 'BEE-111', name: 'Gối Tựa Sofa Boho', slug: 'goi-tua-sofa-boho',
    price: 180000, originalPrice: 240000,
    categoryId: 5, category: 'Textile',
    image: 'https://picsum.photos/id/325/400/500', hoverImage: 'https://picsum.photos/id/326/400/500',
    tag: 'HOT', soldPercentage: 65, stockLeft: 12,
    rating: 4.4, reviews: 38, brand: 'SoftNest',
    inStock: true, isActive: true, createdAt: new Date().toISOString()
  },
  {
    id: 113, sku: 'BEE-113', name: 'Thảm Lụa Trang Trí', slug: 'tham-lua-trang-tri',
    price: 760000, originalPrice: 960000,
    categoryId: 5, category: 'Textile',
    image: 'https://picsum.photos/id/338/400/500', hoverImage: 'https://picsum.photos/id/339/400/500',
    tag: 'DEAL', soldPercentage: 85, stockLeft: 5,
    rating: 4.9, reviews: 102, brand: 'SoftNest',
    inStock: true, isActive: true, createdAt: new Date().toISOString()
  },
  {
    id: 122, sku: 'BEE-122', name: 'Bộ Ly Thủy Tinh Viền Vàng', slug: 'bo-ly-thuy-tinh-vien-vang',
    price: 460000, originalPrice: 520000,
    categoryId: 6, category: 'Kitchen',
    image: 'https://picsum.photos/id/394/400/500', hoverImage: 'https://picsum.photos/id/395/400/500',
    tag: 'NEW', soldPercentage: 45, stockLeft: 20,
    rating: 4.9, reviews: 112, brand: 'Moc Decor',
    inStock: true, isActive: true, createdAt: new Date().toISOString()
  }
];

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:5020/api';

  // Chuyển đổi dữ liệu từ Backend sang Frontend model
  private mapProduct(p: BackendProduct): Product {
    return {
      id: p.productId,
      sku: p.sku,
      name: p.productName,
      slug: p.slug,
      price: p.price,
      originalPrice: p.oldPrice,
      categoryId: p.categoryId,
      category: p.category,
      image: p.image,
      hoverImage: p.hoverImage,
      videoUrl: p.videoUrl,
      tag: p.tag,
      soldPercentage: p.soldPercentage,
      stockLeft: p.stockLeft,
      rating: p.rating ? Math.max(4.5, p.rating) : 4.5,
      reviews: p.reviews,
      brand: p.brand,
      color: p.color,
      material: p.material,
      style: p.style,
      inStock: p.inStock,
      isActive: p.isActive,
      createdAt: p.createdAt,
      description: p.description
    };
  }

  // Chuyển đổi dữ liệu sang review cho frontend
  private mapReview(r: any) {
    return {
      id: r.id,
      productId: r.productId,
      author: r.author,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt
    };
  }

  // --- PROMOTIONS --- Lấy sản phẩm khuyến mại, fallback về dữ liệu mẫu nếu API lỗi
  getPromotions(): Observable<Product[]> {
    return this.http.get<BackendProduct[]>(`${this.baseUrl}/promotions`).pipe(
      map(products => products.map(p => this.mapProduct(p))),
      catchError(() => of(FALLBACK_FLASH_SALE))
    );
  }

  // Lấy tất cả sản phẩm
  getProducts(): Observable<Product[]> {
    return this.http.get<{ items: BackendProduct[] }>(`${this.baseUrl}/products?pageSize=200`).pipe(
      map(result => result.items.map(p => this.mapProduct(p))),
      catchError(() => of(ALL_MOCK_PRODUCTS))
    );
  }

  // Lấy chi tiết sản phẩm
  getProductById(id: number): Observable<Product> {
    return this.http.get<BackendProduct>(`${this.baseUrl}/products/${id}`).pipe(
      map(p => this.mapProduct(p)),
      catchError(() => {
        const product = ALL_MOCK_PRODUCTS.find(p => p.id === id);
        return of(product || ALL_MOCK_PRODUCTS[0]);
      })
    );
  }

  // Lấy tất cả danh mục
  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/categories`).pipe(
      catchError(() => of(MOCK_CATEGORIES))
    );
  }

  // --- FEEDBACK ---
  getFeedbacks(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/feedbacks`).pipe(
      catchError(() => of([]))
    );
  }

  postFeedback(feedback: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/feedbacks`, feedback);
  }

  // --- PRODUCT REVIEWS ---
  getProductReviews(productId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/products/${productId}/reviews`).pipe(
      map(reviews => reviews.map(r => this.mapReview(r))),
      catchError(() => of([]))
    );
  }

  postProductReview(productId: number, review: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/products/${productId}/reviews`, review);
  }
}

