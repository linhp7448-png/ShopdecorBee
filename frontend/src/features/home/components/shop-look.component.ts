import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShopLook } from '@/core/models';
import { HomeFacade } from '@/features/home/data-access/home.facade';
import { IconComponent } from '@/shared/components/icon.component';

@Component({
  selector: 'app-shop-look',
  standalone: true,
  imports: [CommonModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="py-20 bg-cream">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-charcoal text-center mb-2">Shop The Look</h2>
        <p class="text-center text-gray-500 mb-10">Tự tay sắp xếp không gian sống mơ ước</p>

        <div class="flex flex-wrap justify-center gap-4 mb-12">
          @for (look of homeFacade.shopLooks(); track look.id) {
            <button
              (click)="selectLook(look)"
              class="px-6 py-2 rounded-full border-2 font-bold transition-all duration-300"
              [class.bg-honey]="selectedLook().id === look.id"
              [class.border-honey]="selectedLook().id === look.id"
              [class.text-charcoal]="selectedLook().id === look.id"
              [class.bg-transparent]="selectedLook().id !== look.id"
              [class.border-gray-300]="selectedLook().id !== look.id"
              [class.text-gray-500]="selectedLook().id !== look.id"
              [class.hover:border-honey]="selectedLook().id !== look.id"
            >
              {{ look.name }}
            </button>
          }
        </div>

        <div class="animate-fade-in-up">
          <div class="grid lg:grid-cols-3 gap-8 items-start">
            
            <div class="lg:col-span-2 relative rounded-2xl overflow-hidden shadow-2xl bg-gray-200 aspect-[3/2] group">
              @for (look of [selectedLook()]; track look.id) {
                <img 
                  [src]="look.image" 
                  class="absolute inset-0 w-full h-full object-cover transition-opacity duration-700" 
                  [alt]="look.name"
                >
              }
              
              @for (spot of selectedLook().hotspots; track spot.id) {
                <div 
                  class="absolute transition-all duration-500 origin-center" 
                  [style.top.%]="spot.y" 
                  [style.left.%]="spot.x"
                  [class.opacity-0]="!isItemPlaced(spot.id)"
                  [class.scale-50]="!isItemPlaced(spot.id)"
                  [class.opacity-100]="isItemPlaced(spot.id)"
                  [class.scale-100]="isItemPlaced(spot.id)"
                >
                  <div class="relative group/item cursor-pointer" (click)="togglePlacement(spot.id)">
                    <img [src]="spot.product.image" class="w-24 h-24 md:w-32 md:h-32 object-contain drop-shadow-2xl hover:scale-110 transition-transform">
                    <div class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity shadow-lg">
                      <app-icon name="plus" class="w-3 h-3 rotate-45"></app-icon>
                    </div>
                  </div>
                </div>

                <div 
                  class="absolute" 
                  [style.top.%]="spot.y + 10" 
                  [style.left.%]="spot.x + 5"
                >
                  <button 
                    (click)="togglePlacement(spot.id)"
                    class="relative w-8 h-8 bg-white/80 backdrop-blur-sm text-honey rounded-full shadow-lg flex items-center justify-center hover:bg-honey hover:text-white transition-colors z-10"
                    [class.bg-honey]="isItemPlaced(spot.id)"
                    [class.text-white]="isItemPlaced(spot.id)"
                  >
                    <app-icon [name]="isItemPlaced(spot.id) ? 'check' : 'plus'" class="w-5 h-5"></app-icon>
                  </button>
                </div>
              }
            </div>

            <div class="space-y-6">
              <div class="border-l-4 border-honey pl-4">
                <h3 class="text-xl font-bold text-charcoal">{{ selectedLook().name }}</h3>
                <p class="text-sm text-gray-500">{{ selectedLook().description }}</p>
              </div>
              
              <div class="space-y-4">
                @for (spot of selectedLook().hotspots; track spot.id) {
                  <div 
                    class="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer border-2" 
                    [class.border-honey]="isItemPlaced(spot.id)"
                    [class.border-transparent]="!isItemPlaced(spot.id)"
                    (click)="togglePlacement(spot.id)"
                  >
                    <div class="relative">
                      <img [src]="spot.product.image" class="w-16 h-16 rounded-lg object-cover bg-gray-50">
                      @if (isItemPlaced(spot.id)) {
                        <div class="absolute -top-2 -right-2 bg-honey text-white rounded-full p-1 shadow-sm">
                          <app-icon name="check" class="w-3 h-3"></app-icon>
                        </div>
                      }
                    </div>
                    <div class="flex-grow">
                      <h5 class="font-bold text-charcoal text-sm">{{ spot.product.name }}</h5>
                      <p class="text-honey text-xs font-bold">{{ spot.product.price | currency:'VND':'symbol':'1.0-0' }}</p>
                    </div>
                    <button 
                      class="px-3 py-1 text-xs rounded-lg transition-colors font-semibold"
                      [class.bg-charcoal]="!isItemPlaced(spot.id)"
                      [class.text-white]="!isItemPlaced(spot.id)"
                      [class.bg-gray-100]="isItemPlaced(spot.id)"
                      [class.text-gray-500]="isItemPlaced(spot.id)"
                    >
                      {{ isItemPlaced(spot.id) ? 'Gỡ ra' : 'Đặt vào' }}
                    </button>
                  </div>
                }
              </div>

              <div class="pt-4 mt-6 border-t border-gray-100">
                <button 
                  (click)="addAllToCart()"
                  class="w-full py-4 bg-honey text-charcoal font-bold rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
                  [disabled]="getPlacedCount() === 0"
                  [class.opacity-50]="getPlacedCount() === 0"
                >
                  <app-icon name="shopping-cart" class="w-5 h-5"></app-icon>
                  Mua tất cả các món ({{ getPlacedCount() }})
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .animate-fade-in-up {
      animation: fadeInUp 0.6s ease-out forwards;
    }
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class ShopLookComponent {
  homeFacade = inject(HomeFacade);

  selectedLook = signal<ShopLook>(this.homeFacade.shopLooks()[0]);
  placedHotspots = signal<Set<number>>(new Set());

  constructor() {
    // Start with all items placed by default or empty
    const initialSet = new Set<number>();
    this.selectedLook().hotspots.forEach(s => initialSet.add(s.id));
    this.placedHotspots.set(initialSet);
  }

  selectLook(look: ShopLook) {
    this.selectedLook.set(look);
    const newSet = new Set<number>();
    look.hotspots.forEach(s => newSet.add(s.id));
    this.placedHotspots.set(newSet);
  }

  togglePlacement(id: number) {
    this.placedHotspots.update(set => {
      const newSet = new Set(set);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }

  isItemPlaced(id: number): boolean {
    return this.placedHotspots().has(id);
  }

  getPlacedCount(): number {
    return this.placedHotspots().size;
  }

  addAllToCart() {
    const look = this.selectedLook();
    const placedIds = this.placedHotspots();

    look.hotspots.forEach(spot => {
      if (placedIds.has(spot.id)) {
        this.homeFacade.addProductToCart(spot.product, 1);
      }
    });

    // Optional: show a notification or redirect
    alert(`Đã thêm ${this.getPlacedCount()} món vào giỏ hàng!`);
  }
}
