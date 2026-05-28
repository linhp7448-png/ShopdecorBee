import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { HeaderNavCategory, HeaderSubItem } from './header-navigation.types';

@Component({
  selector: 'app-header-navigation',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="hidden xl:flex items-center h-full flex-1 justify-center">
      <ul class="flex items-center gap-0 h-full">
        @for (cat of navigationStructure; track cat.label) {
          <li 
            class="nav-item group h-full flex items-center px-2 xl:px-2.5 2xl:px-3 cursor-pointer whitespace-nowrap" 
            [class.relative]="cat.type === 'dropdown'" 
            [class.static]="cat.type === 'mega'"
          >
            <button
              type="button"
              (click)="navigate.emit(cat)"
              class="nav-link relative py-4 text-xs xl:text-[13px] 2xl:text-sm font-semibold tracking-wide transition-colors duration-300 cursor-pointer hover:text-honey group-hover/header:text-black bg-transparent border-0"
              [ngClass]="solidStyle ? 'text-black' : 'text-white'"
            >
              {{ cat.label }}
              <span class="nav-underline"></span>
            </button>

            @if (cat.type === 'mega') {
              <div class="mega-menu absolute top-full left-0 w-full bg-white shadow-2xl border-t-2 border-honey/30 opacity-0 invisible group-hover:opacity-100 group-hover:visible rounded-b-2xl overflow-hidden z-[102]">
                <div class="mega-menu-inner flex p-8 gap-8">
                  @for (col of cat.columns; track col.title; let colIdx = $index) {
                    <div class="mega-col flex-1 space-y-4" [style.--col-index]="colIdx">
                      <h4 class="mega-col-title font-bold text-black border-b-2 border-honey/20 pb-2 text-base flex items-center gap-2">
                        <span class="w-1.5 h-1.5 bg-honey rounded-full"></span>
                        {{ col.title }}
                      </h4>
                      <ul class="space-y-1">
                        @for (item of col.items; track item.label; let itemIdx = $index) {
                          <li [style.--item-index]="itemIdx">
                            <a (click)="$event.stopPropagation(); navigateSub.emit({ category: cat, item })" class="mega-item text-sm text-gray-700 hover:text-honey transition-all duration-300 block py-1.5 pl-3 border-l-2 border-transparent hover:border-honey hover:pl-4 hover:bg-honey/5 rounded-r cursor-pointer">
                              {{ item.label }}
                            </a>
                          </li>
                        }
                      </ul>
                    </div>
                  }

                  @if (cat.featuredImage) {
                    <div class="mega-featured w-1/4 relative rounded-xl overflow-hidden group/img aspect-[4/3] shadow-lg">
                      <img [src]="cat.featuredImage.src" class="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover/img:scale-110">
                      <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent group-hover/img:from-black/40 transition-all duration-500 flex items-end p-5">
                        <span class="featured-caption bg-white/90 backdrop-blur-sm px-4 py-2.5 text-charcoal font-bold text-sm shadow-xl rounded-lg flex items-center gap-2">
                          {{ cat.featuredImage.caption }}
                          <svg class="w-4 h-4 text-honey transition-transform duration-300 group-hover/img:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
                        </span>
                      </div>
                    </div>
                  }
                </div>
              </div>
            }

            @if (cat.type === 'dropdown') {
              <div class="dropdown-menu absolute top-full left-0 w-64 bg-white shadow-2xl border-t-2 border-honey/30 opacity-0 invisible group-hover:opacity-100 group-hover:visible rounded-b-xl overflow-hidden z-[102]">
                <ul class="py-1">
                  @for (item of cat.items; track item.label; let i = $index) {
                    <li [style.--item-index]="i">
                      <a (click)="$event.stopPropagation(); navigateSub.emit({ category: cat, item })" class="dropdown-item flex items-center gap-3 px-5 py-3 text-sm font-medium text-gray-800 hover:text-honey hover:bg-honey/5 transition-all duration-300 border-l-3 border-transparent hover:border-honey cursor-pointer">
                        <span class="w-1 h-1 rounded-full bg-gray-300 group-hover:bg-honey transition-colors duration-300"></span>
                        {{ item.label }}
                      </a>
                    </li>
                  }
                </ul>
              </div>
            }
          </li>
        }
      </ul>
    </nav>
  `,
  styles: [`
    .nav-link {
      position: relative;
      overflow: hidden;
    }

    .nav-underline {
      position: absolute;
      bottom: 0;
      left: 50%;
      width: 0;
      height: 2.5px;
      background: linear-gradient(90deg, #F6C324, #FDD86D);
      border-radius: 2px;
      transition: width 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), left 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }

    .nav-item:hover .nav-underline {
      width: 100%;
      left: 0;
    }

    .mega-menu {
      transform: translateY(12px) scaleY(0.95);
      transform-origin: top center;
      transition: opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1),
                  visibility 0.35s,
                  transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .nav-item:hover .mega-menu {
      transform: translateY(0) scaleY(1);
    }

    .mega-col {
      opacity: 0;
      transform: translateY(15px);
      transition: opacity 0.4s ease, transform 0.4s ease;
      transition-delay: calc(var(--col-index, 0) * 0.08s + 0.1s);
    }

    .nav-item:hover .mega-col {
      opacity: 1;
      transform: translateY(0);
    }

    .mega-featured {
      opacity: 0;
      transform: translateX(20px);
      transition: opacity 0.5s ease 0.25s, transform 0.5s ease 0.25s;
    }

    .nav-item:hover .mega-featured {
      opacity: 1;
      transform: translateX(0);
    }

    .mega-col-title {
      opacity: 0;
      transform: translateX(-10px);
      transition: opacity 0.3s ease, transform 0.3s ease;
      transition-delay: calc(var(--col-index, 0) * 0.08s + 0.15s);
    }

    .nav-item:hover .mega-col-title {
      opacity: 1;
      transform: translateX(0);
    }

    .mega-item {
      position: relative;
    }

    .mega-item::before {
      content: '>';
      position: absolute;
      left: 0;
      opacity: 0;
      color: #F6C324;
      font-weight: bold;
      transition: opacity 0.2s, transform 0.2s;
      transform: translateX(-5px);
    }

    .mega-item:hover::before {
      opacity: 1;
      transform: translateX(0);
    }

    .dropdown-menu {
      transform: translateY(10px) scale(0.97);
      transform-origin: top left;
      transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                  visibility 0.3s,
                  transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .nav-item:hover .dropdown-menu {
      transform: translateY(0) scale(1);
    }

    .dropdown-item {
      opacity: 0;
      transform: translateX(-8px);
      transition: opacity 0.25s ease, transform 0.25s ease,
                  background-color 0.3s, color 0.3s, padding-left 0.3s, border-color 0.3s;
      transition-delay: calc(var(--item-index, 0) * 0.04s + 0.1s);
    }

    .nav-item:hover .dropdown-item {
      opacity: 1;
      transform: translateX(0);
    }
  `]
})
export class HeaderNavigationComponent {
  @Input({ required: true }) navigationStructure: HeaderNavCategory[] = [];
  @Input({ required: true }) solidStyle = false;

  @Output() readonly navigate = new EventEmitter<HeaderNavCategory>();
  @Output() readonly navigateSub = new EventEmitter<{ category: HeaderNavCategory; item: HeaderSubItem }>();
}
