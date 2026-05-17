import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Category, Product } from '@/core/models';
import { AuthFacade } from '@/features/auth/data-access/auth.facade';
import { CatalogStore } from '@/features/catalog/data-access/catalog.store';
import { CheckoutFacade } from '@/features/checkout/data-access/checkout.facade';
import { SearchFacade } from '@/features/search/data-access/search.facade';
import { CartDrawerComponent } from './cart-drawer.component';
import { HeaderActionsComponent } from './header-actions.component';
import { HeaderNavigationComponent } from './header-navigation.component';
import { HeaderSearchComponent } from './header-search.component';
import { HeaderNavCategory, HeaderSubItem } from './header-navigation.types';
import { MobileMenuComponent } from './mobile-menu.component';

type ResolvedCategoryGroup = {
  id: number;
  name: string;
  slug: string;
  isActive: boolean;
  displayOrder: number;
};

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    CartDrawerComponent,
    HeaderNavigationComponent,
    HeaderSearchComponent,
    HeaderActionsComponent,
    MobileMenuComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostClasses()' },
  template: `
    <div class="top-bar bg-black/40 backdrop-blur-sm text-white text-[11px] md:text-xs font-semibold py-1 text-center tracking-[0.12em] uppercase relative overflow-hidden transition-all duration-500"
         [class.max-h-0]="isScrolled()"
         [class.py-0]="isScrolled()"
         [class.opacity-0]="isScrolled()"
         [class.overflow-hidden]="true">
      <div class="top-bar-shimmer"></div>
      <span class="relative z-10">100% ORIGINAL PRODUCTS</span>
    </div>

    <nav class="header-main group/header transition-all duration-500 hover:bg-white hover:shadow-md"
         [class.bg-transparent]="useTransparentHeader()"
         [class.bg-white]="!useTransparentHeader()"
         [class.shadow-md]="useSolidHeaderStyle()"
         [class.scrolled]="useSolidHeaderStyle()">
      <div class="max-w-screen-2xl mx-auto px-4 h-14 flex items-center gap-2 relative">
        <!-- Left: Hamburger & Logo -->
        <div class="flex items-center gap-2 z-[101]">
          <!-- Hamburger Button (mobile only) -->
          <button
            class="xl:hidden flex items-center justify-center w-8 h-8 rounded-full transition-colors flex-shrink-0"
            [ngClass]="useSolidHeaderStyle() ? 'text-charcoal hover:bg-gray-100' : 'text-white hover:bg-white/10'"
            (click)="mobileMenuOpen.set(true)"
            aria-label="Mở menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <a href="#"
             (click)="goHome($event)"
             class="logo-link flex items-center group flex-shrink-0 transition-all duration-500"
             [class.opacity-0]="isScrolled()"
             [class.w-0]="isScrolled()"
             [class.overflow-hidden]="isScrolled()">
            <img src="/assets/images/logo.png" alt="BeeShop - Phụ kiện decor" class="logo-img h-12 md:h-16 w-auto object-contain transition-all duration-300 group-hover:scale-105 drop-shadow-md">
          </a>
        </div>

        <app-header-navigation
          class="hidden xl:block"
          [navigationStructure]="navigationStructure()"
          [solidStyle]="useSolidHeaderStyle()"
          (navigate)="navigateTo($event)"
          (navigateSub)="navigateToSub($event.category, $event.item)"
        />

        <div class="flex items-center gap-2 md:gap-3 flex-shrink-0 z-[101]">
          <app-header-search
            [query]="searchFacade.query()"
            [isFocused]="isSearchFocused()"
            [keywordSuggestions]="searchFacade.keywordSuggestions()"
            [suggestions]="searchFacade.suggestions()"
            [solidStyle]="useSolidHeaderStyle()"
            (queryChange)="onSearchQueryChange($event)"
            (searchFocus)="onSearchFocus()"
            (searchBlur)="onSearchBlur()"
            (searchEnter)="onSearchEnter()"
            (clearSearch)="clearSearch()"
            (selectKeyword)="selectKeyword($event)"
            (selectProduct)="selectProduct($event)"
          />

          <app-header-actions
            [solidStyle]="useSolidHeaderStyle()"
            [userMenuOpen]="userMenuOpen()"
            [isAuthenticated]="authFacade.isAuthenticated()"
            [isAdmin]="authFacade.isAdmin()"
            [currentUserName]="authFacade.currentUser()?.fullName ?? null"
            [currentUserEmail]="authFacade.currentUser()?.email ?? null"
            [cartCount]="checkoutFacade.cartCount()"
            (toggleUserMenu)="toggleUserMenu()"
            (goToLogin)="goToLogin()"
            (goToOrders)="goToOrders()"
            (goToAdmin)="goToAdmin()"
            (logout)="doLogout()"
            (openCart)="openCartDrawer()"
          />
        </div>
      </div>
    </nav>

    @if (mobileMenuOpen()) {
      <app-mobile-menu
        [isOpen]="mobileMenuOpen()"
        [navigationStructure]="navigationStructure()"
        (close)="mobileMenuOpen.set(false)"
        (navigate)="navigateTo($event); mobileMenuOpen.set(false)"
        (navigateSub)="navigateToSub($event.category, $event.item); mobileMenuOpen.set(false)"
      />
    }

    @if (cartDrawerOpen()) {
      <app-cart-drawer
        [items]="cartDrawerItems()"
        [subtotal]="selectedCartSubtotal()"
        [shippingFee]="selectedCartShippingFee()"
        [grandTotal]="cartGrandTotal()"
        [isAllSelected]="isAllCartItemsSelected()"
        [selectedCount]="selectedCartCount()"
        (close)="closeCartDrawer()"
        (checkout)="goToCheckout()"
        (remove)="removeFromCart($event)"
        (toggleSelection)="toggleCartSelection($event)"
        (toggleSelectAll)="toggleSelectAllInCart($event)"
      />
    }
  `,
  styles: [`
    .top-bar {
      position: relative;
    }

    .top-bar-shimmer {
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
      animation: shimmer 4s ease-in-out infinite;
    }

    @keyframes shimmer {
      0% { left: -100%; }
      50% { left: 100%; }
      100% { left: 100%; }
    }

    .header-main {
      transition: background-color 0.4s ease, box-shadow 0.4s ease, border-color 0.4s ease;
    }

    .header-main:not(.scrolled):not(:hover) {
      background-color: transparent !important;
      box-shadow: none;
    }

    .header-main:hover,
    .header-main.scrolled {
      background-color: #fff;
    }
  `]
})
export class HeaderComponent implements OnInit, OnDestroy {
  private static readonly fallbackGroups: Array<ResolvedCategoryGroup & { categorySlugs: string[] }> = [
    {
      id: -1,
      name: 'Bàn ăn & Bếp',
      slug: 'ban-an-bep',
      isActive: true,
      displayOrder: 1,
      categorySlugs: [
        'bàn-ăn',
        'cốc-ly',
        'thương-hiệu-gốm-bát-tràng'
      ]
    },
    {
      id: -2,
      name: 'Trang trí & Sắp đặt',
      slug: 'trang-tri-sap-dat',
      isActive: true,
      displayOrder: 2,
      categorySlugs: [
        'phụ-kiện',
        'mây-tre',
        'mây-tre-đan',
        'trang-trí',
        'trang-trí-tường',
        'phụ-kiện-điểm-nhấn'
      ]
    },
    {
      id: -3,
      name: 'Vải & Phụ kiện mềm',
      slug: 'vai-phu-kien-mem',
      isActive: true,
      displayOrder: 3,
      categorySlugs: [
        'phụ-kiện-vải'
      ]
    },
    {
      id: -4,
      name: 'Ánh sáng & Hương thơm',
      slug: 'anh-sang-huong-thom',
      isActive: true,
      displayOrder: 4,
      categorySlugs: [
        'hương-thơm',
        'đèn'
      ]
    },
    {
      id: -5,
      name: 'Làm đẹp',
      slug: 'lam-dep',
      isActive: true,
      displayOrder: 5,
      categorySlugs: [
        'trang-điểm',
        'đồ-trang-điểm'
      ]
    }
  ];

  readonly searchFacade = inject(SearchFacade);
  readonly checkoutFacade = inject(CheckoutFacade);
  readonly authFacade = inject(AuthFacade);
  private readonly catalogStore = inject(CatalogStore);

  private readonly router = inject(Router);

  readonly isScrolled = signal(false);
  readonly isHomeRoute = signal(true);
  readonly isSearchFocused = signal(false);
  readonly userMenuOpen = signal(false);
  readonly cartDrawerOpen = signal(false);
  readonly mobileMenuOpen = signal(false);
  readonly selectedCartProductIds = signal<number[]>([]);
  readonly cartDrawerItems = computed(() => {
    const selectedProductIds = new Set(this.selectedCartProductIds());

    return this.checkoutFacade.cartItemsDetailed().map((item) => ({
      ...item,
      isSelected: selectedProductIds.has(item.productId)
    }));
  });
  readonly selectedCartItems = computed(() => this.cartDrawerItems().filter((item) => item.isSelected));
  readonly selectedCartSubtotal = computed(() =>
    this.selectedCartItems().reduce((sum, item) => sum + item.lineTotal, 0)
  );
  readonly selectedCartShippingFee = computed(() => this.selectedCartItems().length > 0 ? this.checkoutFacade.shippingFee() : 0);
  readonly selectedCartCount = computed(() => this.selectedCartItems().length);
  readonly isAllCartItemsSelected = computed(() => {
    const items = this.cartDrawerItems();
    return items.length > 0 && items.every((item) => item.isSelected);
  });
  readonly cartGrandTotal = computed(() => this.selectedCartSubtotal() + this.selectedCartShippingFee());

  private scrollCleanup: (() => void) | null = null;
  private routeCleanup: (() => void) | null = null;
  private searchBlurTimer: ReturnType<typeof setTimeout> | null = null;

  readonly navigationStructure = computed(() => this.buildNavigation(this.catalogStore.categories()));

  constructor(@Inject(PLATFORM_ID) private readonly platformId: object) { }

  readonly hostClasses = () => {
    return this.useSolidHeaderStyle()
      ? 'block fixed top-0 left-0 right-0 z-[100]'
      : 'block absolute top-0 left-0 right-0 z-[100]';
  };

  readonly useTransparentHeader = () => this.isHomeRoute() && !this.isScrolled();
  readonly useSolidHeaderStyle = () => !this.isHomeRoute() || this.isScrolled();

  ngOnInit() {
    this.catalogStore.ensureCategoriesLoaded();
    this.updateRouteState();
    const routeSub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.closeTransientUi();
        this.updateRouteState();
      }
    });
    this.routeCleanup = () => routeSub.unsubscribe();

    if (isPlatformBrowser(this.platformId)) {
      const onScroll = () => {
        this.isScrolled.set(window.scrollY > 50);
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      this.scrollCleanup = () => window.removeEventListener('scroll', onScroll);
    }
  }

  ngOnDestroy() {
    this.scrollCleanup?.();
    this.routeCleanup?.();
    if (this.searchBlurTimer) {
      clearTimeout(this.searchBlurTimer);
    }
  }

  navigateTo(cat: HeaderNavCategory) {
    this.closeTransientUi();
    if (cat.link) {
      this.router.navigateByUrl(cat.link);
    } else if (cat.categoryNames?.length) {
      this.router.navigate(['/search'], { queryParams: { category: cat.categoryNames.join(',') } });
    }

    this.scrollToTop();
  }

  navigateToSub(cat: HeaderNavCategory, item: HeaderSubItem) {
    this.closeTransientUi();
    if (item.link) {
      this.router.navigateByUrl(item.link);
    } else if (item.slug) {
      this.router.navigate(['/collections', item.slug]);
    } else if (item.categoryName) {
      this.router.navigate(['/search'], { queryParams: { category: item.categoryName } });
    } else if (cat.categoryNames?.length) {
      this.router.navigate(['/search'], { queryParams: { category: cat.categoryNames.join(',') } });
    }

    this.scrollToTop();
  }

  goHome(event: Event) {
    event.preventDefault();
    this.closeTransientUi();
    this.router.navigate(['/']);
    this.scrollToTop();
  }

  onSearchQueryChange(query: string) {
    this.searchFacade.setQuery(query);
  }

  onSearchFocus() {
    this.searchFacade.ensureSearchIndexLoaded();
    if (this.searchBlurTimer) {
      clearTimeout(this.searchBlurTimer);
      this.searchBlurTimer = null;
    }
    this.isSearchFocused.set(true);
  }

  onSearchBlur() {
    this.searchBlurTimer = setTimeout(() => {
      this.isSearchFocused.set(false);
    }, 150);
  }

  onSearchEnter() {
    const query = this.searchFacade.query();
    if (query) {
      this.closeTransientUi();
      this.router.navigate(['/search'], { queryParams: { q: query } });
    }
  }

  clearSearch() {
    this.searchFacade.clearQuery();
  }

  selectProduct(product: Product) {
    this.searchFacade.setQuery(product.name);
    this.isSearchFocused.set(false);
    this.closeTransientUi();
    this.router.navigate(['/search'], { queryParams: { q: product.name } });
  }

  selectKeyword(keyword: string) {
    this.searchFacade.applySuggestedKeyword(keyword);
    this.isSearchFocused.set(false);
    this.closeTransientUi();
    this.router.navigate(['/search'], { queryParams: { q: keyword } });
  }

  toggleUserMenu() {
    this.cartDrawerOpen.set(false);
    this.userMenuOpen.update((value) => !value);
  }

  openCartDrawer() {
    this.userMenuOpen.set(false);
    this.selectedCartProductIds.set(this.checkoutFacade.cartItemsDetailed().map((item) => item.productId));
    this.cartDrawerOpen.set(true);
  }

  closeCartDrawer() {
    this.cartDrawerOpen.set(false);
  }

  goToLogin() {
    this.closeTransientUi();
    this.router.navigate(['/login']);
  }

  goToAdmin() {
    this.closeTransientUi();
    this.router.navigate(['/admin']);
  }

  goToOrders() {
    this.closeTransientUi();
    this.router.navigate(['/orders']);
  }

  doLogout() {
    this.authFacade.logout();
    this.checkoutFacade.resetForGuest();
    this.closeTransientUi();
    this.router.navigate(['/']);
  }

  goToCheckout() {
    this.closeTransientUi();
    this.router.navigate(['/checkout']);
  }

  toggleCartSelection(productId: number) {
    const availableProductIds = new Set(this.checkoutFacade.cartItemsDetailed().map((item) => item.productId));
    if (!availableProductIds.has(productId)) {
      return;
    }

    this.selectedCartProductIds.update((selectedIds) => {
      const normalizedSelection = selectedIds.filter((id) => availableProductIds.has(id));
      return normalizedSelection.includes(productId)
        ? normalizedSelection.filter((id) => id !== productId)
        : [...normalizedSelection, productId];
    });
  }

  toggleSelectAllInCart(selectAll: boolean) {
    this.selectedCartProductIds.set(
      selectAll
        ? this.checkoutFacade.cartItemsDetailed().map((item) => item.productId)
        : []
    );
  }

  removeFromCart(productId: number) {
    this.selectedCartProductIds.update((selectedIds) => selectedIds.filter((id) => id !== productId));
    this.checkoutFacade.removeFromCart(productId);
  }

  private buildNavigation(categories: Category[]): HeaderNavCategory[] {
    const groupedCategories = new Map<string, {
      label: string;
      slug: string;
      displayOrder: number;
      items: HeaderSubItem[];
      categoryNames: string[];
    }>();

    categories
      .map((category) => ({ category, group: this.resolveCategoryGroup(category) }))
      .filter((entry): entry is { category: Category; group: ResolvedCategoryGroup } =>
        entry.category.isActive && !!entry.group && entry.group.isActive)
      .sort((left, right) => left.category.name.localeCompare(right.category.name, 'vi'))
      .forEach(({ category, group }) => {
        const existingGroup = groupedCategories.get(group.slug);
        if (existingGroup) {
          existingGroup.items.push({
            label: category.name,
            slug: category.slug,
            categoryName: category.name
          });
          existingGroup.categoryNames.push(category.name);
          return;
        }

        groupedCategories.set(group.slug, {
          label: group.name,
          slug: group.slug,
          displayOrder: group.displayOrder,
          items: [
            {
              label: category.name,
              slug: category.slug,
              categoryName: category.name
            }
          ],
          categoryNames: [category.name]
        });
      });

    const categoryMenus = Array.from(groupedCategories.values())
      .sort((left, right) => left.displayOrder - right.displayOrder || left.label.localeCompare(right.label, 'vi'))
      .map<HeaderNavCategory>((group) => ({
        label: group.label,
        slug: group.slug,
        type: 'dropdown',
        categoryNames: group.categoryNames,
        items: group.items
      }));

    return [
      {
        label: 'Mới nhất',
        type: 'link',
        link: '/new-collection'
      },
      ...categoryMenus,
      {
        label: 'Liên hệ',
        type: 'link',
        link: '/contact'
      }
    ];
  }

  private updateRouteState() {
    const currentPath = this.router.url.split('?')[0];
    this.isHomeRoute.set(currentPath === '' || currentPath === '/' || currentPath === '/home');
  }

  private resolveCategoryGroup(category: Category): ResolvedCategoryGroup | null {
    if (category.group) {
      return category.group;
    }

    const fallbackGroup = HeaderComponent.fallbackGroups.find((group) => group.categorySlugs.includes(category.slug));
    return fallbackGroup
      ? {
        id: fallbackGroup.id,
        name: fallbackGroup.name,
        slug: fallbackGroup.slug,
        isActive: fallbackGroup.isActive,
        displayOrder: fallbackGroup.displayOrder
      }
      : null;
  }

  private closeTransientUi() {
    this.userMenuOpen.set(false);
    this.cartDrawerOpen.set(false);
  }

  private scrollToTop() {
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}
