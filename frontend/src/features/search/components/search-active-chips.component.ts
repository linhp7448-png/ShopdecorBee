import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { SearchFilterChip } from './search-results.types';

@Component({
  selector: 'app-search-active-chips',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-wrap items-center gap-2">
      @for (chip of chips; track chip.label) {
        <button
          class="text-xs rounded-full border border-honey/50 bg-honey/10 text-charcoal px-3 py-1 hover:bg-honey/20"
          (click)="removeChip.emit(chip)"
        >
          {{ chip.label }} ×
        </button>
      }
      <button class="text-xs text-honey font-semibold underline" (click)="clearAll.emit()">Xóa tất cả bộ lọc</button>
    </div>
  `
})
export class SearchActiveChipsComponent {
  @Input({ required: true }) chips: SearchFilterChip[] = [];

  @Output() readonly removeChip = new EventEmitter<SearchFilterChip>();
  @Output() readonly clearAll = new EventEmitter<void>();
}
