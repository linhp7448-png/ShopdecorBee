import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { IconComponent } from '@/shared/components/icon.component';
import { SearchPriceInputChange, SearchQuickPriceRange } from './search-results.types';

@Component({
  selector: 'app-search-filter-panel',
  standalone: true,
  imports: [CommonModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
      <h3 class="font-bold text-charcoal mb-4 flex items-center gap-2">
        <app-icon name="filter" class="w-4 h-4"></app-icon>
        Bộ lọc
      </h3>

      <div class="space-y-4">
        <div>
          <h4 class="text-sm font-semibold mb-2">Danh mục</h4>
          <div class="space-y-2 max-h-36 overflow-auto pr-1">
            @for (category of availableCategories; track category) {
              <label class="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  class="accent-honey"
                  [checked]="selectedCategories.includes(category)"
                  (change)="toggleCategoryRequested.emit(category)"
                >
                <span>{{ category }}</span>
              </label>
            }
          </div>
        </div>

        <div>
          <h4 class="text-sm font-semibold mb-2">Thương hiệu</h4>
          <div class="space-y-2 max-h-36 overflow-auto pr-1">
            @for (brand of availableBrands; track brand) {
              <label class="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  class="accent-honey"
                  [checked]="selectedBrands.includes(brand)"
                  (change)="toggleBrandRequested.emit(brand)"
                >
                <span>{{ brand }}</span>
              </label>
            }
          </div>
        </div>

        <div>
          <h4 class="text-sm font-semibold mb-2">Khoảng giá</h4>
          <div class="grid grid-cols-2 gap-2 mb-2">
            <input
              type="number"
              [value]="minPriceInput"
              (input)="emitPriceInputChange('min', $event)"
              placeholder="Từ"
              class="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm"
            >
            <input
              type="number"
              [value]="maxPriceInput"
              (input)="emitPriceInputChange('max', $event)"
              placeholder="Đến"
              class="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm"
            >
          </div>
          <button class="w-full text-sm bg-charcoal text-white rounded-lg py-2 hover:bg-black" (click)="applyPriceRangeRequested.emit()">
            Áp dụng giá
          </button>
          <div class="flex flex-wrap gap-2 mt-2">
            @for (range of quickPriceRanges; track range.label) {
              <button
                class="text-xs px-2 py-1 rounded-full bg-gray-100 hover:bg-honey/20"
                (click)="applyQuickPriceRequested.emit(range)"
              >
                {{ range.label }}
              </button>
            }
          </div>
        </div>

        <div>
          <h4 class="text-sm font-semibold mb-2">Phong cách</h4>
          <div class="flex flex-wrap gap-2">
            @for (style of availableStyles; track style) {
              <button
                class="text-xs px-3 py-1 rounded-full border"
                [class.border-honey]="selectedStyles.includes(style)"
                [class.bg-honey]="selectedStyles.includes(style)"
                [class.border-gray-200]="!selectedStyles.includes(style)"
                (click)="toggleStyleRequested.emit(style)"
              >
                {{ style }}
              </button>
            }
          </div>
        </div>

        <div>
          <h4 class="text-sm font-semibold mb-2">Chất liệu</h4>
          <div class="flex flex-wrap gap-2">
            @for (mat of availableMaterials; track mat) {
              <button
                class="text-xs px-3 py-1 rounded-full border"
                [class.border-honey]="selectedMaterials.includes(mat)"
                [class.bg-honey]="selectedMaterials.includes(mat)"
                [class.border-gray-200]="!selectedMaterials.includes(mat)"
                (click)="toggleMaterialRequested.emit(mat)"
              >
                {{ mat }}
              </button>
            }
          </div>
        </div>

        <div>
          <h4 class="text-sm font-semibold mb-2">Màu sắc</h4>
          <div class="flex flex-wrap gap-2">
            @for (col of availableColors; track col) {
              <button
                class="w-6 h-6 rounded-full border flex items-center justify-center transition-transform hover:scale-110"
                [style.backgroundColor]="isValidHex(col) ? col : '#f3f4f6'"
                [title]="col"
                [class.ring-2]="selectedColors.includes(col)"
                [class.ring-honey]="selectedColors.includes(col)"
                [class.ring-offset-2]="selectedColors.includes(col)"
                (click)="toggleColorRequested.emit(col)"
              >
                @if (!isValidHex(col)) {
                  <span class="text-[8px] overflow-hidden whitespace-nowrap">{{ col }}</span>
                }
              </button>
            }
          </div>
        </div>

        <div>
          <h4 class="text-sm font-semibold mb-2">Khác</h4>
          <label class="flex items-center gap-2 text-sm mb-2 cursor-pointer">
            <input
              type="checkbox"
              class="accent-honey"
              [checked]="inStockOnly"
              (change)="emitInStockOnlyChange($event)"
            >
            <span>Chỉ còn hàng</span>
          </label>
          <label class="flex items-center gap-2 text-sm mb-2 cursor-pointer">
            <input
              type="checkbox"
              class="accent-honey"
              [checked]="onSaleOnly"
              (change)="emitOnSaleOnlyChange($event)"
            >
            <span>Đang khuyến mại</span>
          </label>
          <div class="flex flex-wrap gap-2 mt-2">
            @for (rate of ratingOptions; track rate) {
              <button
                class="text-xs px-3 py-1 rounded-full border"
                [class.border-honey]="ratingGte === rate"
                [class.bg-honey]="ratingGte === rate"
                [class.border-gray-200]="ratingGte !== rate"
                (click)="setRatingRequested.emit(ratingGte === rate ? 0 : rate)"
              >
                Từ {{ rate }} sao
              </button>
            }
          </div>
        </div>
      </div>
    </div>
  `
})
export class SearchFilterPanelComponent {
  readonly ratingOptions = [5, 4, 3];

  @Input({ required: true }) availableCategories: string[] = [];
  @Input({ required: true }) availableBrands: string[] = [];
  @Input({ required: true }) availableStyles: string[] = [];
  @Input({ required: true }) availableMaterials: string[] = [];
  @Input({ required: true }) availableColors: string[] = [];

  @Input({ required: true }) selectedCategories: string[] = [];
  @Input({ required: true }) selectedBrands: string[] = [];
  @Input({ required: true }) selectedStyles: string[] = [];
  @Input({ required: true }) selectedMaterials: string[] = [];
  @Input({ required: true }) selectedColors: string[] = [];

  @Input({ required: true }) minPriceInput = '';
  @Input({ required: true }) maxPriceInput = '';
  @Input({ required: true }) quickPriceRanges: SearchQuickPriceRange[] = [];
  @Input({ required: true }) inStockOnly = false;
  @Input({ required: true }) onSaleOnly = false;
  @Input({ required: true }) ratingGte = 0;

  @Output() readonly toggleCategoryRequested = new EventEmitter<string>();
  @Output() readonly toggleBrandRequested = new EventEmitter<string>();
  @Output() readonly toggleStyleRequested = new EventEmitter<string>();
  @Output() readonly toggleMaterialRequested = new EventEmitter<string>();
  @Output() readonly toggleColorRequested = new EventEmitter<string>();
  @Output() readonly priceInputChanged = new EventEmitter<SearchPriceInputChange>();
  @Output() readonly applyPriceRangeRequested = new EventEmitter<void>();
  @Output() readonly applyQuickPriceRequested = new EventEmitter<SearchQuickPriceRange>();
  @Output() readonly toggleInStockOnlyRequested = new EventEmitter<boolean>();
  @Output() readonly toggleOnSaleOnlyRequested = new EventEmitter<boolean>();
  @Output() readonly setRatingRequested = new EventEmitter<number>();

  emitPriceInputChange(type: 'min' | 'max', event: Event): void {
    this.priceInputChanged.emit({
      type,
      value: (event.target as HTMLInputElement).value
    });
  }

  emitInStockOnlyChange(event: Event): void {
    this.toggleInStockOnlyRequested.emit((event.target as HTMLInputElement).checked);
  }

  emitOnSaleOnlyChange(event: Event): void {
    this.toggleOnSaleOnlyRequested.emit((event.target as HTMLInputElement).checked);
  }

  isValidHex(color: string): boolean {
    return /^#[0-9A-F]{6}$/i.test(color);
  }
}
