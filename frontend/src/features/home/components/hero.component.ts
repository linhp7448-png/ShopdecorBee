import { Component, ChangeDetectionStrategy, signal, OnDestroy, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { IconComponent } from '@/shared/components/icon.component';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="relative h-[400px] md:h-[500px] w-full overflow-hidden group bg-charcoal-dark">
      
      <!-- Slides Loop -->
      @for (slide of slides; track $index) {
        <div 
          class="absolute inset-0 transition-opacity duration-1000 ease-in-out"
          [class.opacity-100]="currentSlide() === $index"
          [class.opacity-0]="currentSlide() !== $index"
          [class.pointer-events-none]="currentSlide() !== $index"
        >
          <!-- Background Image -->
          <img 
            [src]="slide.image" 
            [alt]="slide.title" 
            class="absolute inset-0 w-full h-full object-cover"
          />
          
          <!-- Overlay Gradient -->
          <div class="absolute inset-0 bg-black/40"></div>

          <!-- Content Container -->
          <div class="absolute inset-0 flex items-center">
            <div class="container mx-auto px-4 md:px-6">
              <div class="max-w-xl space-y-6 text-white">
                <!-- Title Animation -->
                <h1 
                  class="text-3xl md:text-5xl font-extrabold leading-tight tracking-tight drop-shadow-md transition-all duration-700 delay-100 transform"
                  [class.translate-y-0]="currentSlide() === $index"
                  [class.opacity-100]="currentSlide() === $index"
                  [class.translate-y-10]="currentSlide() !== $index"
                  [class.opacity-0]="currentSlide() !== $index"
                >
                  <span [innerHTML]="slide.title"></span>
                </h1>
                
                <!-- Subtitle Animation -->
                <p 
                  class="text-base md:text-lg font-light text-cream/90 transition-all duration-700 delay-200 transform"
                  [class.translate-y-0]="currentSlide() === $index"
                  [class.opacity-100]="currentSlide() === $index"
                  [class.translate-y-10]="currentSlide() !== $index"
                  [class.opacity-0]="currentSlide() !== $index"
                >
                  {{ slide.subtitle }}
                </p>

                <!-- CTA Button -->
                <div 
                  class="transition-all duration-700 delay-300 transform"
                  [class.translate-y-0]="currentSlide() === $index"
                  [class.opacity-100]="currentSlide() === $index"
                  [class.translate-y-10]="currentSlide() !== $index"
                  [class.opacity-0]="currentSlide() !== $index"
                >
                  <button class="mt-4 px-8 py-3 bg-honey text-charcoal font-bold rounded-lg shadow-lg hover:bg-[#E5B520] hover:shadow-xl hover:scale-105 transition-all duration-300 transform flex items-center gap-2">
                    {{ slide.cta }} <app-icon name="arrow-right" class="w-4 h-4"></app-icon>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Dots Indicator -->
      <div class="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        @for (slide of slides; track $index) {
          <button 
            (click)="setSlide($index)"
            class="h-2 rounded-full transition-all duration-300 shadow-sm"
            [class.w-8]="currentSlide() === $index"
            [class.bg-honey]="currentSlide() === $index"
            [class.w-2]="currentSlide() !== $index"
            [class.bg-white/60]="currentSlide() !== $index"
            [class.hover:bg-white]="currentSlide() !== $index"
            aria-label="Go to slide"
          ></button>
        }
      </div>

      <!-- Arrow Controls -->
      <button 
        (click)="prevSlide()" 
        class="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/20 hover:bg-honey hover:text-charcoal text-white backdrop-blur-sm flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-20"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>

      <button 
        (click)="nextSlide()" 
        class="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/20 hover:bg-honey hover:text-charcoal text-white backdrop-blur-sm flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-20"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>

    </section>
  `
})
export class HeroComponent implements OnInit, OnDestroy {
  currentSlide = signal(0);
  private intervalId: any;

  slides = [
    {
      image: 'https://picsum.photos/id/429/1920/1080',
      title: 'Kiến tạo <br/> <span class="text-honey">tổ ấm ngọt ngào</span>',
      subtitle: 'Những món đồ nhỏ xinh xua tan mệt mỏi sau một ngày dài. Biến ngôi nhà thành nơi bình yên nhất.',
      cta: 'Khám phá ngay'
    },
    {
      image: 'https://picsum.photos/id/1065/1920/1080',
      title: 'Góc làm việc <br/> <span class="text-honey">đầy cảm hứng</span>',
      subtitle: 'Nâng cao năng suất và sự sáng tạo với những phụ kiện bàn làm việc tinh tế, gọn gàng.',
      cta: 'Xem bộ sưu tập'
    },
    {
      image: 'https://picsum.photos/id/366/1920/1080',
      title: 'Thư giãn <br/> <span class="text-honey">cùng thiên nhiên</span>',
      subtitle: 'Mang màu xanh vào không gian sống với những chậu cây và kệ decor tối giản.',
      cta: 'Mua ngay'
    }
  ];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.startAutoSlide();
    }
  }

  ngOnDestroy() {
    this.stopAutoSlide();
  }

  private startAutoSlide() {
    this.stopAutoSlide();
    this.intervalId = setInterval(() => {
      this.currentSlide.update(curr => (curr + 1) % this.slides.length);
    }, 5000);
  }

  private stopAutoSlide() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  setSlide(index: number) {
    this.stopAutoSlide();
    this.currentSlide.set(index);
    this.startAutoSlide();
  }

  nextSlide() {
    this.stopAutoSlide();
    this.currentSlide.update(curr => (curr + 1) % this.slides.length);
    this.startAutoSlide();
  }

  prevSlide() {
    this.stopAutoSlide();
    this.currentSlide.update(curr => (curr - 1 + this.slides.length) % this.slides.length);
    this.startAutoSlide();
  }
}
