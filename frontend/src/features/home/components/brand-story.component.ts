import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeFacade } from '@/features/home/data-access/home.facade';
import { IconComponent } from '@/shared/components/icon.component';

@Component({
  selector: 'app-brand-story',
  standalone: true,
  imports: [CommonModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="py-16 bg-cream border-t border-gray-100">
      <div class="container mx-auto px-4">
        
        <div class="flex flex-col lg:flex-row gap-12">
          
          <!-- Brand Story Column (40%) -->
          <div class="lg:w-2/5 space-y-6">
            <h2 class="text-3xl font-bold text-charcoal mb-4">Chuyện Nhà Bee</h2>
            <div class="relative rounded-2xl overflow-hidden shadow-lg group">
              <img src="https://picsum.photos/id/534/600/400" alt="Brand Story" class="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105">
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6 text-white">
                <p class="text-lg font-light leading-relaxed mb-4">
                  "BeeShop ra đời với mong muốn mang đến những món đồ nhỏ bé nhưng đủ sức 'F5' lại không gian, giúp bạn tìm thấy sự bình yên trong chính tổ ấm của mình..."
                </p>
              </div>
            </div>
            <button class="px-6 py-2 border-2 border-charcoal text-charcoal font-bold rounded hover:bg-charcoal hover:text-white transition-colors">
              Tìm hiểu thêm
            </button>
          </div>

          <!-- Blog Column (60%) -->
          <div class="lg:w-3/5">
             <div class="flex items-center justify-between mb-8">
               <h3 class="text-2xl font-bold text-charcoal">Góc Cảm Hứng</h3>
               <a href="#" class="text-honey-600 font-semibold hover:underline">Xem tất cả</a>
             </div>

             <div class="space-y-6">
               @for (post of homeFacade.blogPosts(); track post.id) {
                 <div class="flex flex-col sm:flex-row gap-4 group cursor-pointer border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                   <div class="sm:w-1/3 overflow-hidden rounded-lg">
                     <img [src]="post.image" class="w-full h-32 object-cover transition-transform duration-500 group-hover:scale-110">
                   </div>
                   <div class="sm:w-2/3 flex flex-col justify-center">
                     <div class="flex items-center gap-2 text-xs text-gray-500 mb-2">
                       <app-icon name="calendar" class="w-3 h-3"></app-icon>
                       <span>{{ post.date }}</span>
                     </div>
                     <h4 class="text-lg font-bold text-charcoal mb-2 group-hover:text-honey transition-colors">{{ post.title }}</h4>
                     <p class="text-sm text-gray-600 line-clamp-2">{{ post.summary }}</p>
                   </div>
                 </div>
               }
             </div>
          </div>

        </div>
      </div>
    </section>
  `
})
export class BrandStoryComponent {
  homeFacade = inject(HomeFacade);
}
