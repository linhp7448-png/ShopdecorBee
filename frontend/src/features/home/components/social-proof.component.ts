import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeFacade } from '@/features/home/data-access/home.facade';
import { IconComponent } from '@/shared/components/icon.component';

@Component({
  selector: 'app-social-proof',
  standalone: true,
  imports: [CommonModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="py-16">
      <div class="container mx-auto px-4 mb-8 text-center">
        <h2 class="text-2xl font-bold text-charcoal mb-2">Chia sẻ không gian cùng #BeeShop</h2>
        <p class="text-gray-500">Tag chúng mình để được xuất hiện tại đây nhé!</p>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-5 gap-1 md:gap-4 px-2 md:px-0">
        @for (img of homeFacade.instagramFeed(); track $index) {
          <div class="relative aspect-square group overflow-hidden cursor-pointer">
            <img [src]="img" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">
            
            <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center text-white">
              <app-icon name="instagram" class="w-8 h-8"></app-icon>
            </div>
          </div>
        }
      </div>
    </section>
  `
})
export class SocialProofComponent {
  homeFacade = inject(HomeFacade);
}
