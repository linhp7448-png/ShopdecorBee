import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Product } from '@/core/models';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-header-search',
  standalone: true,
  imports: [CommonModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative group hidden lg:block w-[200px] xl:w-[220px] transition-all duration-500 ease-out focus-within:w-[280px]">
      <div
        class="search-bar flex items-center rounded-full px-4 py-2 border transition-all duration-500 focus-within:border-honey focus-within:ring-2 focus-within:ring-honey/30 focus-within:bg-white focus-within:shadow-lg focus-within:shadow-honey/10 group-hover/header:bg-[#f5f5f5] group-hover/header:border-[#e5e5e5]"
        [ngClass]="solidStyle ? 'bg-[#f5f5f5] border-[#e5e5e5]' : 'bg-white/15 border-white/20'"
      >
        <app-icon
          name="search"
          class="search-icon w-4 h-4 transition-colors duration-300 group-focus-within:text-honey group-hover/header:text-[#999]"
          [ngClass]="solidStyle ? 'text-[#999]' : 'text-white/70'"
        ></app-icon>
        <input
          type="text"
          [value]="query"
          (input)="emitQueryChange($event)"
          (focus)="searchFocus.emit()"
          (blur)="searchBlur.emit()"
          (keydown.enter)="searchEnter.emit()"
          placeholder="Tìm sản phẩm..."
          class="search-input ml-2 w-full bg-transparent border-none outline-none text-sm focus:text-charcoal focus:placeholder-gray-400 group-hover/header:text-[#333] group-hover/header:placeholder:text-[#999]"
          [ngClass]="solidStyle ? 'text-[#333] placeholder:text-[#999]' : 'text-white placeholder:text-white/50'"
        >
        @if (query) {
          <button
            type="button"
            (click)="clearSearch.emit()"
            class="text-gray-400 hover:text-red-500 hover:rotate-90 transition-all duration-300"
          >
            <app-icon name="close" class="w-4 h-4"></app-icon>
          </button>
        }
      </div>

      @if (isFocused && (keywordSuggestions.length > 0 || (query && suggestions.length > 0))) {
        <div class="absolute top-full right-0 mt-2 w-[350px] bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-[102] animate-dropdown origin-top-right">
          @if (keywordSuggestions.length > 0) {
            <div class="px-3 pt-3 pb-2 border-b border-gray-100">
              <p class="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">Gợi ý từ khóa</p>
              <div class="flex flex-wrap gap-2">
                @for (keyword of keywordSuggestions; track keyword) {
                  <button
                    type="button"
                    (click)="selectKeyword.emit(keyword)"
                    class="text-xs px-2.5 py-1.5 rounded-full bg-cream text-charcoal hover:bg-honey hover:text-charcoal transition-colors"
                  >
                    {{ keyword }}
                  </button>
                }
              </div>
            </div>
          }

          @if (query && suggestions.length > 0) {
            @for (product of suggestions; track product.id) {
              <div (click)="selectProduct.emit(product)" class="flex items-center gap-3 p-3 hover:bg-cream cursor-pointer transition-all duration-300 border-b border-gray-50 last:border-0 hover:pl-5">
                <img [src]="product.image" class="w-10 h-10 object-cover rounded-lg bg-gray-100 shadow-sm transition-transform duration-300 hover:scale-110">
                <div class="flex-grow min-w-0">
                  <h4 class="text-sm font-bold text-charcoal truncate">{{ product.name | uppercase }}</h4>
                  <p class="text-xs text-honey font-bold">{{ product.price | currency:'VND':'symbol':'1.0-0' }}</p>
                </div>
              </div>
            }
          }

          <div (click)="searchEnter.emit()" class="p-3 bg-gradient-to-r from-honey/10 to-honey/5 text-center cursor-pointer hover:from-honey hover:to-honey-light hover:text-white transition-all duration-500 group/cta">
            <span class="text-sm font-bold text-honey group-hover/cta:text-white transition-colors">Xem tất cả kết quả →</span>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .search-bar {
      transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .animate-dropdown {
      animation: dropdownIn 0.35s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }

    @keyframes dropdownIn {
      from { opacity: 0; transform: translateY(-8px) scale(0.96); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
  `]
})
export class HeaderSearchComponent {
  @Input({ required: true }) query = '';
  @Input({ required: true }) isFocused = false;
  @Input({ required: true }) keywordSuggestions: string[] = [];
  @Input({ required: true }) suggestions: Product[] = [];
  @Input({ required: true }) solidStyle = false;

  @Output() readonly queryChange = new EventEmitter<string>();
  @Output() readonly searchFocus = new EventEmitter<void>();
  @Output() readonly searchBlur = new EventEmitter<void>();
  @Output() readonly searchEnter = new EventEmitter<void>();
  @Output() readonly clearSearch = new EventEmitter<void>();
  @Output() readonly selectKeyword = new EventEmitter<string>();
  @Output() readonly selectProduct = new EventEmitter<Product>();

  emitQueryChange(event: Event): void {
    this.queryChange.emit((event.target as HTMLInputElement).value);
  }
}
