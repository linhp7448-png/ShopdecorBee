import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    @keyframes crossfade {
      0%, 25% { opacity: 1; transform: scale(1); }
      33%, 92% { opacity: 0; transform: scale(1.05); }
      100% { opacity: 1; transform: scale(1); }
    }
    .fade-carousel {
      opacity: 0;
      animation: crossfade 12s infinite;
    }
  `],
  template: `
    <section class="py-16 bg-cream">
      <div class="container mx-auto px-4 max-w-6xl">
        <h2 class="text-center text-3xl md:text-4xl font-black text-charcoal mb-12 tracking-tight">Vũ trụ không gian sống</h2>
        
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          @for (cat of categories; track cat.name) {
            <a [routerLink]="['/search']" [queryParams]="{ category: cat.filter }" class="group cursor-pointer block">
              <!-- Arched Shape Container -->
              <div class="relative overflow-hidden rounded-t-[100px] rounded-b-2xl aspect-[3/4] shadow-lg border-2 border-white hover:border-honey transition-all duration-300 bg-gray-100 hover:shadow-honey/20 hover:-translate-y-2">
                
                @for (img of cat.images; track img; let i = $index) {
                  <img 
                    [src]="img" 
                    [alt]="cat.name"
                    class="absolute inset-0 w-full h-full object-cover fade-carousel"
                    [style.animation-delay]="(i * 4) + 's'"
                  >
                }

                <!-- Overlay & Text -->
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent flex items-end justify-center pb-8 opacity-90 group-hover:opacity-100 transition-opacity">
                  <span class="px-6 py-3 bg-white/95 backdrop-blur-md rounded-full text-charcoal font-black text-sm md:text-base shadow-xl transform group-hover:-translate-y-2 group-hover:bg-honey transition-all duration-300">
                    {{ cat.name }}
                  </span>
                </div>
              </div>
            </a>
          }
        </div>
      </div>
    </section>
  `
})
export class CategoriesComponent {
  categories = [
    {
      name: 'Trang trí nội thất',
      filter: 'Trang trí',
      images: [
        'https://picsum.photos/id/1015/400/600',
        'https://picsum.photos/id/1025/400/600',
        'https://picsum.photos/id/1035/400/600'
      ]
    },
    {
      name: 'Bếp & Bàn ăn',
      filter: 'Bàn ăn',
      images: [
        'https://picsum.photos/id/425/400/600',
        'https://picsum.photos/id/429/400/600',
        'https://picsum.photos/id/431/400/600'
      ]
    },
    {
      name: 'Đèn & Ánh sáng',
      filter: 'Đèn',
      images: [
        'https://picsum.photos/id/366/400/600',
        'https://picsum.photos/id/104/400/600',
        'https://picsum.photos/id/163/400/600'
      ]
    },
    {
      name: 'Hương Thơm Tinh Tế',
      filter: 'Hương thơm',
      images: [
        'https://picsum.photos/id/493/400/600',
        'https://picsum.photos/id/510/400/600',
        'https://picsum.photos/id/515/400/600'
      ]
    }
  ];
}
