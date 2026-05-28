import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ProductDetailFacade } from '@/features/product/data-access/product-detail.facade';
import { CheckoutFacade } from '@/features/checkout/data-access/checkout.facade';
import { IconComponent } from '@/shared/components/icon.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="bg-white min-h-screen py-10" *ngIf="productFacade.selectedProduct() as product">
      <div class="container mx-auto px-4 grid lg:grid-cols-2 gap-12">
        <!-- Gallery -->
        <div class="space-y-4">
          <div class="aspect-square rounded-2xl overflow-hidden border border-gray-100 bg-gray-50">
            <img [src]="currentImage() || product.image" 
                 class="w-full h-full object-contain transition-all duration-500 ease-in-out transform hover:scale-105">
          </div>
          <div class="grid grid-cols-4 gap-4">
            @for (image of productFacade.productImages(); track $index) {
              <button class="aspect-square rounded-xl overflow-hidden border-2 transition-all"
                      [class.border-honey]="currentImage() === image"
                      [class.border-transparent]="currentImage() !== image"
                      (click)="currentImage.set(image)">
                <img [src]="image" class="w-full h-full object-cover">
              </button>
            }
          </div>
        </div>

        <!-- Info -->
        <div class="flex flex-col">
          <div class="mb-6">
            <nav class="flex text-sm text-gray-400 mb-4 items-center gap-2">
              <a href="/" class="hover:text-honey">Trang chủ</a>
              <span>/</span>
              <a [href]="'/collections/' + product.slug" class="hover:text-honey uppercase tracking-wider">{{ product.category }}</a>
            </nav>
            <h1 class="text-4xl font-bold text-charcoal mb-2">{{ product.name | uppercase }}</h1>
            <p class="text-sm text-gray-400 uppercase tracking-widest font-medium">SKU: {{ product.sku }}</p>
          </div>

          <div class="flex items-center gap-2 mb-6">
            <div class="flex items-center gap-1.5 px-2 py-1 rounded-lg">
              <app-icon name="star-filled" class="w-4 h-4 text-yellow-500 translate-y-[-0.5px]"></app-icon>
              <span class="text-lg font-bold text-charcoal">{{ product.rating || 5 | number:'1.1-1' }}</span>
            </div>
            <span class="text-sm text-gray-500 font-medium ml-2">(Còn {{ product.stockLeft || 0 }} sản phẩm)</span>
          </div>

          <div class="flex items-center gap-4 mb-8">
            <span class="text-3xl font-extrabold text-honey">{{ product.price | currency:'VND':'symbol':'1.0-0' }}</span>
            @if (product.originalPrice && product.originalPrice > product.price) {
              <span class="text-xl text-gray-300 line-through">{{ product.originalPrice | currency:'VND':'symbol':'1.0-0' }}</span>
              <span class="bg-red-50 text-red-500 px-2 py-1 rounded text-xs font-bold">
                -{{ ((product.originalPrice - product.price) / product.originalPrice * 100) | number:'1.0-0' }}%
              </span>
            }
          </div>

          <!-- Description Section -->
          <div class="border-t border-b border-gray-100 py-6 mb-8">
            <h3 class="text-lg font-bold mb-4 flex items-center gap-2 text-charcoal">
              <app-icon name="info" class="w-5 h-5 text-honey"></app-icon>
              Chi tiết sản phẩm
            </h3>
            
            <div class="space-y-4">
              <div class="text-gray-600 leading-relaxed text-lg italic bg-gray-50 p-4 rounded-xl border-l-4 border-honey">
                {{ formatDescription(product.description).main }}
              </div>

              @if (formatDescription(product.description).specs) {
                <div class="grid grid-cols-1 gap-3">
                  <div class="bg-cream/50 p-5 rounded-2xl border border-honey/10">
                    <p class="font-bold text-charcoal mb-2 flex items-center gap-2">
                       <app-icon name="grid" class="w-4 h-4"></app-icon> Thông số kỹ thuật
                    </p>
                    <ul class="space-y-1">
                       @for (spec of formatDescription(product.description).specs; track spec) {
                         <li class="text-sm text-gray-600 flex items-center gap-2">
                           <span class="w-1.5 h-1.5 rounded-full bg-honey/40"></span>
                           {{ spec }}
                         </li>
                       }
                    </ul>
                  </div>
                </div>
              }

              @if (formatDescription(product.description).labels.length > 0) {
                <div class="flex flex-wrap gap-2 pt-2">
                  @for (label of formatDescription(product.description).labels; track label) {
                    <span class="bg-gray-100 text-gray-500 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                      {{ label }}
                    </span>
                  }
                </div>
              }
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-4 mb-10">
            <div class="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
              <button class="px-4 py-2 hover:bg-gray-50 transition-colors" (click)="updateQuantity(-1)">-</button>
              <span class="px-6 py-2 font-bold min-w-[50px] text-center text-lg">{{ quantity() }}</span>
              <button class="px-4 py-2 hover:bg-gray-50 transition-colors" (click)="updateQuantity(1)">+</button>
            </div>
            <button class="flex-1 bg-charcoal text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-honey hover:text-charcoal transition-all shadow-lg shadow-charcoal/10 hover:shadow-honey/20 transform hover:-translate-y-0.5 active:translate-y-0"
                    (click)="addToCart()">
              THÊM VÀO GIỎ HÀNG
            </button>
          </div>

          <!-- Trust Badges -->
          <div class="grid grid-cols-2 gap-4">
            <div class="flex items-center gap-3 p-3 rounded-xl bg-green-50/50 border border-green-100">
              <app-icon name="truck" class="w-6 h-6 text-green-600"></app-icon>
              <span class="text-xs font-medium text-green-800">Miễn phí vận chuyển đơn >500k</span>
            </div>
            <div class="flex items-center gap-3 p-3 rounded-xl bg-orange-50/50 border border-orange-100">
              <app-icon name="shield" class="w-6 h-6 text-orange-600"></app-icon>
              <span class="text-xs font-medium text-orange-800">Bảo hành 1 đổi 1 trong 7 ngày</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Reviews Section -->
      <div class="container mx-auto px-4 mt-20">
        <div class="border-t pt-20">
          <div class="grid lg:grid-cols-3 gap-12">
            <!-- Review Stats & Form -->
            <div class="lg:col-span-1 space-y-8">
              <div>
                <h2 class="text-3xl font-bold text-charcoal mb-6">Đánh giá từ khách hàng</h2>
                <div class="flex items-center gap-6">
                   <div class="text-6xl font-black text-honey">{{ product.rating || 5 | number:'1.1-1' }}</div>
                   <div class="space-y-1">
                     <div class="flex items-center text-honey gap-1.5">
                        <app-icon name="star-filled" class="w-5 h-5 translate-y-[-1px]"></app-icon>
                        <span class="text-lg font-bold text-charcoal">Đánh giá chung</span>
                     </div>
                     <div class="text-gray-400 text-sm italic">Dựa trên {{ product.reviews || 0 }} lượt nhận xét</div>
                   </div>
                </div>
              </div>

              <!-- Write Review Form -->
              <div class="bg-cream p-8 rounded-3xl border border-honey/10">
                <h3 class="text-xl font-bold text-charcoal mb-6">Viết nhận xét của bạn</h3>
                <form class="space-y-4" (ngSubmit)="submitComment()">
                  <div class="space-y-2">
                    <label class="text-sm font-bold text-gray-600 block">Tên hiển thị</label>
                    <input [(ngModel)]="author" name="author" 
                           class="w-full border-gray-200 border rounded-xl px-4 py-3 focus:ring-2 focus:ring-honey outline-none" 
                           placeholder="Nhập tên của bạn..." required>
                  </div>
                  
                  <div class="space-y-2">
                    <label class="text-sm font-bold text-gray-600 block">Đánh giá số sao</label>
                    <div class="flex gap-2">
                      @for (star of [1,2,3,4,5]; track star) {
                        <button type="button" (click)="rating = star" class="transition-transform active:scale-90">
                           <app-icon [name]="star <= rating ? 'star-filled' : 'star-outline'" 
                                    class="w-8 h-8" [class.text-honey]="star <= rating" [class.text-gray-300]="star > rating"></app-icon>
                        </button>
                      }
                    </div>
                  </div>

                  <div class="space-y-2">
                    <label class="text-sm font-bold text-gray-600 block">Nội dung bình luận</label>
                    <textarea [(ngModel)]="comment" name="comment" 
                             class="w-full border-gray-200 border rounded-xl px-4 py-3 h-32 focus:ring-2 focus:ring-honey outline-none resize-none" 
                             placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..." required></textarea>
                  </div>

                  <button class="w-full bg-honey text-charcoal px-6 py-4 rounded-xl font-bold hover:bg-honey-dark transition-all transform hover:-translate-y-1 shadow-lg shadow-honey/20" 
                          type="submit">
                    GỬI ĐÁNH GIÁ NGAY
                  </button>
                </form>
              </div>
            </div>

            <!-- Review List -->
            <div class="lg:col-span-2 space-y-6">
               @if (productFacade.reviews().length === 0) {
                 <div class="bg-gray-50 rounded-2xl p-12 text-center text-gray-400">
                   <app-icon name="edit" class="w-12 h-12 mx-auto mb-4 opacity-20"></app-icon>
                   <p class="text-lg">Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên nhận xét!</p>
                 </div>
               } @else {
                 @for (review of productFacade.reviews(); track review.id) {
                    <div class="bg-white p-6 rounded-2xl border border-gray-100 hover:border-honey/20 transition-all hover:shadow-lg hover:shadow-charcoal/5 group animate-fade-in translate-y-0 opacity-100 duration-500">
                      <div class="flex justify-between items-start mb-4">
                        <div>
                          <div class="flex items-center gap-3 mb-1">
                            <div class="w-10 h-10 rounded-full bg-honey/10 flex items-center justify-center text-honey font-bold">
                              {{ review.author.charAt(0).toUpperCase() }}
                            </div>
                            <span class="font-bold text-charcoal">{{ review.author }}</span>
                            <span class="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded font-bold border border-green-100 uppercase tracking-tighter">Đã mua hàng</span>
                          </div>
                          <div class="flex items-center gap-1.5 mt-0.5">
                            <app-icon name="star-filled" class="w-3.5 h-3.5 text-yellow-500 translate-y-[-0.5px]"></app-icon>
                            <span class="font-bold text-charcoal text-sm">{{ review.rating | number:'1.1-1' }}</span>
                          </div>
                        </div>
                        <span class="text-xs text-gray-400 italic font-medium">{{ review.createdAt | date:'dd/MM/yyyy' }}</span>
                      </div>
                      <p class="text-gray-600 leading-relaxed italic border-l-4 border-honey/20 pl-4">"{{ review.comment }}"</p>
                    </div>
                 }
               }
            </div>
          </div>
        </div>
      </div>
    </section>
  `
})
export class ProductDetailComponent {
  productFacade = inject(ProductDetailFacade);
  checkoutFacade = inject(CheckoutFacade);
  route = inject(ActivatedRoute);

  currentImage = signal<string | null>(null);
  quantity = signal<number>(1);

  author = '';
  rating = 5;
  comment = '';

  constructor() {
    const idStr = this.route.snapshot.paramMap.get('id');
    if (idStr) {
      this.productFacade.selectProductById(Number(idStr));
    }
  }

  updateQuantity(delta: number): void {
    const newVal = this.quantity() + delta;
    if (newVal >= 1) this.quantity.set(newVal);
  }

  addToCart(): void {
    const productId = this.productFacade.selectedProduct().id;
    if (productId > 0) {
      this.checkoutFacade.addToCart(productId, this.quantity());
      // Optional: triggering a small UI feedback
    }
  }

  submitComment(): void {
    if (!this.author || !this.comment) return;

    this.productFacade.addComment(this.author, this.rating, this.comment);
    this.author = '';
    this.rating = 5;
    this.comment = '';
  }

  formatDescription(desc: string | undefined) {
    if (!desc) return { main: '', specs: [], labels: [] };

    // Split combined data from DB script
    const parts = desc.split('[THÔNG SỐ]');
    const main = parts[0].trim();

    let specs: string[] = [];
    let labels: string[] = [];

    if (parts.length > 1) {
      const remaining = parts[1];
      const specPart = remaining.split('[CHẤT LIỆU]:')[0].trim();
      specs = specPart.split(',').map(s => s.trim()).filter(s => !!s);

      const materialMatch = remaining.match(/\[CHẤT LIỆU\]:\s*(.*?)\r?\n/);
      const styleMatch = remaining.match(/\[PHONG CÁCH\]:\s*(.*?)$/);

      if (materialMatch) labels.push(materialMatch[1].trim());
      if (styleMatch) labels.push(styleMatch[1].trim());
    }

    return { main, specs, labels };
  }
}
