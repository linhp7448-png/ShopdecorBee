import { Injectable, computed, signal, inject } from '@angular/core';
import { Product, ProductViewDto, mapProductViewDtoToProduct } from '@/core/models';
import { HttpClient } from '@angular/common/http';
import { apiEndpoints } from '@/core/api/api-endpoints';

interface ProductReview {
  id: number;
  productId: number;
  author: string;
  rating: number;
  comment: string;
  createdAt: string;
}

const REVIEWS: ProductReview[] = [
  { id: 1, productId: 101, author: 'Lan Anh', rating: 5, comment: 'Chất liệu đẹp, đóng gói rất kỹ.', createdAt: '2026-03-09' },
  { id: 2, productId: 101, author: 'Huy', rating: 4, comment: 'Màu sắc đúng như mô tả.', createdAt: '2026-03-11' }
];

@Injectable({ providedIn: 'root' })
export class ProductDetailFacade {
  private readonly http = inject(HttpClient);

  readonly selectedProduct = signal<Product | null>(null);
  readonly isLoading = signal(false);
  readonly hasError = signal(false);
  readonly errorMessage = signal<string | null>(null);
  private readonly reviewsSignal = signal<ProductReview[]>(REVIEWS);

  readonly productImages = computed(() => {
    const product = this.selectedProduct();
    if (!product) return [];
    return [product.image, product.hoverImage, product.image, product.hoverImage];
  });

  readonly reviews = computed(() => {
    const p = this.selectedProduct();
    if (!p) return [];
    return this.reviewsSignal().filter((item) => item.productId === p.id);
  });

  selectProductById(id: number): void {
    this.selectedProduct.set(null);
    this.isLoading.set(true);
    this.hasError.set(false);
    this.errorMessage.set(null);

    this.http.get<ProductViewDto>(apiEndpoints.products.detail(id))
      .subscribe({
        next: (dto) => {
          this.selectedProduct.set(mapProductViewDtoToProduct(dto));
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Failed to load product', err);
          this.selectedProduct.set(null);
          this.isLoading.set(false);
          this.hasError.set(true);
          this.errorMessage.set('Khong tai duoc thong tin san pham.');
        }
      });
  }

  addComment(author: string, rating: number, comment: string): void {
    const p = this.selectedProduct();
    if (!p) return;
    this.reviewsSignal.update((list) => [
      {
        id: Date.now(),
        productId: p.id,
        author,
        rating,
        comment,
        createdAt: new Date().toISOString().split('T')[0]
      },
      ...list
    ]);
  }
}

