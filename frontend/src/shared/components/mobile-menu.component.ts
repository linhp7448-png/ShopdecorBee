import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HeaderNavCategory, HeaderSubItem } from './header-navigation.types';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-mobile-menu',
  standalone: true,
  imports: [CommonModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Overlay -->
    @if (isOpen) {
      <div 
        class="fixed inset-0 bg-black/50 z-[105] backdrop-blur-sm transition-opacity duration-300"
        (click)="close.emit()"
      ></div>
    }

    <!-- Drawer -->
    <div 
      class="fixed inset-y-0 left-0 w-[280px] bg-white z-[110] transform transition-transform duration-300 ease-in-out shadow-2xl overflow-y-auto flex flex-col"
      [class.translate-x-0]="isOpen"
      [class.-translate-x-full]="!isOpen"
    >
      <!-- Header -->
      <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
        <h2 class="text-lg font-bold text-charcoal">Menu</h2>
        <button 
          (click)="close.emit()"
          class="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-charcoal"
        >
          <app-icon name="close" class="w-5 h-5"></app-icon>
        </button>
      </div>

      <!-- Mobile Search -->
      <div class="px-5 py-3 border-b border-gray-50 bg-gray-50/50">
        <div class="relative">
          <app-icon name="search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"></app-icon>
          <input 
            type="text" 
            placeholder="Tìm sản phẩm..." 
            class="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-honey"
            (keydown.enter)="onSearchEnter($event)"
          >
        </div>
      </div>

      <!-- Navigation List -->
      <nav class="flex-1 py-2">
        <ul class="flex flex-col">
          @for (cat of navigationStructure; track cat.label) {
            <li class="border-b border-gray-50">
              <!-- No Sub Items -->
              @if (cat.type === 'link') {
                <a 
                  (click)="onNavigate(cat)"
                  class="flex items-center justify-between px-5 py-3.5 text-[15px] font-semibold text-charcoal hover:bg-honey/5 hover:text-honey transition-colors cursor-pointer"
                >
                  {{ cat.label }}
                  <span class="w-1.5 h-1.5 bg-gray-200 rounded-full"></span>
                </a>
              }
              
              <!-- Dropsown or Mega Menu -->
              @if (cat.type === 'dropdown' || cat.type === 'mega') {
                <div>
                  <button 
                    (click)="toggleCategory(cat.label)"
                    class="w-full flex items-center justify-between px-5 py-3.5 text-[15px] font-semibold transition-colors cursor-pointer text-left"
                    [class.text-honey]="expandedCategory() === cat.label"
                    [class.text-charcoal]="expandedCategory() !== cat.label"
                    [class.bg-honey/5]="expandedCategory() === cat.label"
                  >
                    {{ cat.label }}
                    <app-icon 
                      name="chevron-down" 
                      class="w-4 h-4 transition-transform duration-300"
                      [class.rotate-180]="expandedCategory() === cat.label"
                    ></app-icon>
                  </button>
                  
                  <div 
                    class="overflow-hidden transition-all duration-300 ease-in-out bg-gray-50/50"
                    [class.max-h-0]="expandedCategory() !== cat.label"
                    [class.max-h-[1000px]]="expandedCategory() === cat.label"
                  >
                    @if (cat.type === 'mega' && cat.columns) {
                      <ul class="py-2 px-5 pb-4">
                        @for (col of cat.columns; track col.title) {
                          <li class="mb-4 last:mb-0">
                            <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-2">{{ col.title }}</h4>
                            <ul class="space-y-1">
                              @for (item of col.items; track item.label) {
                                <li>
                                  <a 
                                    (click)="onNavigateSub(cat, item)"
                                    class="block py-1.5 text-sm text-gray-600 hover:text-honey transition-colors cursor-pointer"
                                  >
                                    {{ item.label }}
                                  </a>
                                </li>
                              }
                            </ul>
                          </li>
                        }
                      </ul>
                    }
                    
                    @if (cat.type === 'dropdown' && cat.items) {
                      <ul class="py-2 px-5 pb-4 space-y-1">
                        @for (item of cat.items; track item.label) {
                          <li>
                            <a 
                              (click)="onNavigateSub(cat, item)"
                              class="block py-1.5 text-sm text-gray-600 hover:text-honey transition-colors cursor-pointer"
                            >
                              {{ item.label }}
                            </a>
                          </li>
                        }
                      </ul>
                    }
                  </div>
                </div>
              }
            </li>
          }
        </ul>
      </nav>

    </div>
  `
})
export class MobileMenuComponent {
  private readonly router = inject(Router);
  @Input({ required: true }) isOpen = false;
  @Input({ required: true }) navigationStructure: HeaderNavCategory[] = [];

  @Output() close = new EventEmitter<void>();
  @Output() navigate = new EventEmitter<HeaderNavCategory>();
  @Output() navigateSub = new EventEmitter<{ category: HeaderNavCategory, item: HeaderSubItem }>();

  expandedCategory = signal<string | null>(null);

  toggleCategory(label: string) {
    if (this.expandedCategory() === label) {
      this.expandedCategory.set(null);
    } else {
      this.expandedCategory.set(label);
    }
  }

  onNavigate(cat: HeaderNavCategory) {
    this.close.emit();
    this.navigate.emit(cat);
  }

  onNavigateSub(cat: HeaderNavCategory, item: HeaderSubItem) {
    this.close.emit();
    this.navigateSub.emit({ category: cat, item });
  }

  onSearchEnter(event: Event) {
    const query = (event.target as HTMLInputElement).value;
    if (query.trim()) {
      this.close.emit();
      this.router.navigate(['/search'], { queryParams: { q: query.trim() } });
    }
  }
}
