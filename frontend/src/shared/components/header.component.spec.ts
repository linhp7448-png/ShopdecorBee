import { TestBed } from '@angular/core/testing';
import { NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  const routerEvents$ = new Subject<NavigationEnd>();
  const router = {
    url: '/',
    events: routerEvents$.asObservable(),
    navigate: vi.fn().mockResolvedValue(true)
  };

  beforeEach(async () => {
    router.url = '/';
    router.navigate.mockClear();

    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        { provide: Router, useValue: router }
      ]
    }).compileComponents();
  });

  it('creates the header shell with extracted child components', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    expect(component).toBeTruthy();
    expect(component.navigationStructure.length).toBeGreaterThan(0);
  });

  it('opens the cart drawer from the shell state', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    component.openCartDrawer();
    fixture.detectChanges();

    expect(component.cartDrawerOpen()).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Giỏ hàng');
  });
});
