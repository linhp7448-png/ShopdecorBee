import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Params, Router, convertToParamMap } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { SearchResultsComponent } from './search-results.component';

describe('SearchResultsComponent', () => {
  const queryParamMap$ = new BehaviorSubject(
    convertToParamMap({
      q: 'den',
      category: 'Lighting',
      minPrice: '100000',
      sort: 'price-desc'
    })
  );
  const router = {
    navigate: vi.fn().mockResolvedValue(true)
  };

  beforeEach(async () => {
    queryParamMap$.next(
      convertToParamMap({
        q: 'den',
        category: 'Lighting',
        minPrice: '100000',
        sort: 'price-desc'
      })
    );
    router.navigate.mockClear();

    await TestBed.configureTestingModule({
      imports: [SearchResultsComponent],
      providers: [
        { provide: Router, useValue: router },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: queryParamMap$.asObservable()
          }
        }
      ]
    }).compileComponents();
  });

  it('hydrates search state from the current query params', () => {
    const fixture = TestBed.createComponent(SearchResultsComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    expect(component.searchFacade.query()).toBe('den');
    expect(component.searchFacade.selectedCategories()).toEqual(['Lighting']);
    expect(component.searchFacade.minPrice()).toBe(100000);
    expect(component.searchFacade.sortBy()).toBe('price-desc');
    expect(component.minPriceInput()).toBe('100000');
    expect(component.maxPriceInput()).toBe('');
  });

  it('syncs URL state when the search query changes', () => {
    const fixture = TestBed.createComponent(SearchResultsComponent);
    fixture.detectChanges();

    fixture.componentInstance.onSearchInput({
      target: { value: 'khay go' }
    } as unknown as Event);

    expect(router.navigate).toHaveBeenCalledWith([], {
      relativeTo: TestBed.inject(ActivatedRoute),
      queryParams: {
        q: 'khay go',
        category: 'Lighting',
        minPrice: 100000,
        sort: 'price-desc'
      },
      replaceUrl: true
    });
  });

  it('clears the query and removes q from query params while preserving other filters', () => {
    const fixture = TestBed.createComponent(SearchResultsComponent);
    fixture.detectChanges();

    fixture.componentInstance.clearQuery();

    const navigationCall = router.navigate.mock.calls.at(-1);
    const navigationExtras = navigationCall?.[1] as { queryParams: Params };

    expect(fixture.componentInstance.searchFacade.query()).toBe('');
    expect(navigationExtras.queryParams).toEqual({
      category: 'Lighting',
      minPrice: 100000,
      sort: 'price-desc'
    });
  });
});
