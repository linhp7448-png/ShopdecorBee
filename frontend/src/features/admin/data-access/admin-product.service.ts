import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface ProductView {
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
}

export interface ProductUpsertInput {
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
  stockLeft: number;
  rating: number;
  reviews: number;
  brand: string;
  color: string;
  material: string;
  style: string;
  inStock: boolean;
  isActive: boolean;
}

export interface CategoryView {
  id: number;
  name: string;
  slug: string;
  isActive: boolean;
  group?: {
    id: number;
    name: string;
    slug: string;
    isActive: boolean;
    displayOrder: number;
  };
}

@Injectable({ providedIn: 'root' })
export class AdminProductService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:5020/api/products';
  private readonly categoriesUrl = 'http://localhost:5020/api/categories';

  getProducts(pageSize: number = 20, includeInactive: boolean = true): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}?pageSize=${pageSize}&includeInactive=${includeInactive}`);
  }

  getProductById(id: number): Observable<ProductView> {
    return this.http.get<ProductView>(`${this.baseUrl}/${id}`);
  }

  createProduct(product: ProductUpsertInput): Observable<ProductView> {
    return this.http.post<ProductView>(this.baseUrl, product);
  }

  updateProduct(id: number, product: ProductUpsertInput): Observable<ProductView> {
    return this.http.put<ProductView>(`${this.baseUrl}/${id}`, product);
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getCategories(): Observable<CategoryView[]> {
    return this.http.get<CategoryView[]>(this.categoriesUrl);
  }

  uploadImage(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    
    // Auth token is required for the upload controller
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders(token ? { 'Authorization': `Bearer ${token}` } : {});

    return this.http.post<{ url: string }>('http://localhost:5020/api/upload/image', formData, { headers }).pipe(
      map(res => ({
        url: res.url.startsWith('http') ? res.url : `http://localhost:5020${res.url}`
      }))
    );
  }
}
