import { Component, ChangeDetectionStrategy, HostListener, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from './icon.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-floating-actions',
  standalone: true,
  imports: [CommonModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed bottom-6 right-6 flex flex-col gap-4 z-50">
      
      <!-- Chat Button -->
      <button 
        (click)="goToContact()"
        class="w-12 h-12 md:w-14 md:h-14 bg-[#0068FF] text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform animate-bounce-slow" 
        title="Chat với BeeShop"
      >
        <app-icon name="message-circle" class="w-6 h-6 md:w-8 md:h-8"></app-icon>
      </button>

      <!-- Back To Top Button -->
      @if (showBackToTop()) {
        <button 
          (click)="scrollToTop()"
          class="w-10 h-10 md:w-12 md:h-12 bg-honey text-charcoal rounded-full shadow-lg flex items-center justify-center hover:-translate-y-1 transition-transform border-2 border-white"
          title="Lên đầu trang"
        >
          <app-icon name="arrow-up" class="w-5 h-5 md:w-6 md:h-6"></app-icon>
        </button>
      }
    </div>
  `,
  styles: [`
    @keyframes bounce-slow {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-5px); }
    }
    .animate-bounce-slow {
      animation: bounce-slow 2s infinite;
    }
  `],
  host: {
    '(window:scroll)': 'onWindowScroll()'
  }
})
export class FloatingActionsComponent {
  private readonly router = inject(Router);
  showBackToTop = signal(false);

  onWindowScroll() {
    this.showBackToTop.set(window.scrollY > 300);
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  goToContact() {
    this.router.navigate(['/contact']);
  }
}
