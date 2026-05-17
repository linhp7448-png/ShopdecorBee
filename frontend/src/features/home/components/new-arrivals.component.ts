import { Component, ChangeDetectionStrategy, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeFacade } from '@/features/home/data-access/home.facade';
import { IconComponent } from '@/shared/components/icon.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-new-arrivals',
  standalone: true,
  imports: [CommonModule, IconComponent, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    .hide-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .hide-scrollbar {
      -ms-overflow-style: none;  /* IE and Edge */
      scrollbar-width: none;  /* Firefox */
    }
  `],
  template: `
    <section class="py-16 bg-white overflow-hidden">
      <div class="container mx-auto px-4">
        
        <div class="flex items-center justify-between mb-8">
          <h2 class="text-2xl md:text-3xl font-bold text-charcoal">Mới hốt về</h2>
          <div class="hidden md:flex gap-2">
            <button (click)="scrollLeft()" class="p-2 border border-gray-200 rounded-full hover:bg-honey hover:border-honey hover:text-white transition-colors">
              <app-icon name="chevron-left" class="w-5 h-5"></app-icon>
            </button>
            <button (click)="scrollRight()" class="p-2 border border-gray-200 rounded-full hover:bg-honey hover:border-honey hover:text-white transition-colors">
              <app-icon name="chevron-right" class="w-5 h-5"></app-icon>
            </button>
          </div>
        </div>

        <div class="relative -mx-4 px-4 md:mx-0 md:px-0">
          <div 
            #scrollContainer
            class="flex gap-4 md:gap-6 overflow-x-auto pb-6 pt-2 snap-x snap-mandatory hide-scrollbar scroll-smooth select-none cursor-grab active:cursor-grabbing"
            (mousedown)="startDrag($event)"
            (mousemove)="doDrag($event)"
            (mouseup)="stopDrag()"
            (mouseleave)="stopDrag()"
          >
            @for (product of homeFacade.newArrivals(); track product.id) {
                <div 
                  [routerLink]="['/product', product.id]"
                  class="w-[48%] sm:w-[45%] md:w-[30%] lg:w-[23%] flex-shrink-0 snap-always snap-start group cursor-pointer"
                >
                    <div class="relative overflow-hidden rounded-xl mb-3 aspect-[4/5] bg-gray-50 shadow-sm border border-gray-100 group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-300">
                       <!-- Images -->
                       <img [src]="product.image" (error)="handleImageError($event)" class="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-0 pointer-events-none">
                       <img [src]="product.hoverImage" (error)="handleImageError($event)" class="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-hover:scale-105 pointer-events-none">
                       
                       <!-- New Tag -->
                       <div class="absolute top-2 left-2 bg-[#E8F5E9]/90 backdrop-blur-sm text-[#2E7D32] text-[9px] font-black px-2 py-1 rounded shadow-sm tracking-wider">
                         NEW
                       </div>
                    </div>
                    
                    <div class="space-y-1 px-1">
                      <p class="text-[9px] text-gray-400 font-bold uppercase tracking-widest truncate">{{ product.category }}</p>
                      <h3 class="text-sm font-bold text-charcoal group-hover:text-honey transition-colors line-clamp-1 min-h-[1.2rem] capitalize">{{ product.name.toLowerCase() }}</h3>
                      
                      <div class="flex items-center gap-3 pt-0.5">
                        <p class="text-honey font-bold text-base">{{ product.price | currency:'VND':'symbol':'1.0-0' }}</p>
                        @if (product.originalPrice && product.originalPrice > product.price) {
                          <p class="text-gray-300 text-[10px] line-through font-medium">{{ product.originalPrice | currency:'VND':'symbol':'1.0-0' }}</p>
                        }
                      </div>
  
                      <div class="flex items-center gap-1 mt-1">
                        <app-icon name="star-filled" class="w-2.5 h-2.5 text-yellow-500 translate-y-[1.5px]"></app-icon>
                        <span class="text-[10px] text-gray-500 font-medium leading-none">
                          {{ product.rating || 4.5 }} • ({{ product.reviews || 0 }})
                        </span>
                      </div>
                    </div>
                </div>
            }
          </div>
        </div>

      </div>
    </section>
  `
})
export class NewArrivalsComponent {
  homeFacade = inject(HomeFacade);
  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;

  isDragging = false;
  startX = 0;
  scrollLeftPos = 0;

  handleImageError(event: any) {
    event.target.src = 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=600&auto=format&fit=crop';
  }

  scrollLeft() {
    if (this.scrollContainer) {
      this.scrollContainer.nativeElement.scrollBy({ left: -300, behavior: 'smooth' });
    }
  }

  scrollRight() {
    if (this.scrollContainer) {
      this.scrollContainer.nativeElement.scrollBy({ left: 300, behavior: 'smooth' });
    }
  }

  startDrag(e: MouseEvent) {
    this.isDragging = true;
    this.scrollContainer.nativeElement.classList.remove('scroll-smooth', 'snap-x', 'snap-mandatory');
    this.startX = e.pageX - this.scrollContainer.nativeElement.offsetLeft;
    this.scrollLeftPos = this.scrollContainer.nativeElement.scrollLeft;
  }

  stopDrag() {
    this.isDragging = false;
    this.scrollContainer.nativeElement.classList.add('scroll-smooth', 'snap-x', 'snap-mandatory');
  }

  doDrag(e: MouseEvent) {
    if (!this.isDragging) return;
    e.preventDefault();
    const x = e.pageX - this.scrollContainer.nativeElement.offsetLeft;
    const walk = (x - this.startX) * 1.5;
    this.scrollContainer.nativeElement.scrollLeft = this.scrollLeftPos - walk;
  }
}
