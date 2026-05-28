import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CouponView {
  id: number;
  code: string;
  discountPercentage: number;
  expiryDate: string;
  maxUsage: number;
  currentUsage: number;
  isActive: boolean;
  createdAt: string;
}

export interface CreateCouponInput {
  code: string;
  discountPercentage: number;
  expiryDate: string;
  maxUsage: number;
}

export interface BannerView {
  id: number;
  title: string;
  imageUrl: string;
  link: string;
  position: number;
  isActive: boolean;
}

export interface UpdateBannerInput {
  title: string;
  imageUrl: string;
  link: string;
  position: number;
  isActive: boolean;
}

export interface BlogPostView {
  id: number;
  title: string;
  slug: string;
  content: string;
  author: string;
  imageUrl: string;
  views: number;
  createdAt: string;
}

export interface CreateBlogPostInput {
  title: string;
  slug: string;
  content: string;
  author: string;
  imageUrl: string;
}

@Injectable({ providedIn: 'root' })
export class AdminMarketingService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:5020/api/marketing';

  // Coupons
  getCoupons(): Observable<CouponView[]> {
    return this.http.get<CouponView[]>(`${this.baseUrl}/coupons`);
  }

  createCoupon(input: CreateCouponInput): Observable<CouponView> {
    return this.http.post<CouponView>(`${this.baseUrl}/coupons`, input);
  }

  deleteCoupon(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/coupons/${id}`);
  }

  // Banners
  getBanners(): Observable<BannerView[]> {
    return this.http.get<BannerView[]>(`${this.baseUrl}/banners`);
  }

  updateBanner(id: number | null, input: UpdateBannerInput): Observable<BannerView> {
    const url = id ? `${this.baseUrl}/banners/${id}` : `${this.baseUrl}/banners`;
    return this.http.put<BannerView>(url, input);
  }

  deleteBanner(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/banners/${id}`);
  }

  // Blog Posts
  getBlogPosts(): Observable<BlogPostView[]> {
    return this.http.get<BlogPostView[]>(`${this.baseUrl}/blogs`);
  }

  createBlogPost(input: CreateBlogPostInput): Observable<BlogPostView> {
    return this.http.post<BlogPostView>(`${this.baseUrl}/blogs`, input);
  }

  deleteBlogPost(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/blogs/${id}`);
  }
}
