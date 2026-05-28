import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AdminDashboardComponent } from './admin-dashboard.component';

describe('AdminDashboardComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminDashboardComponent],
      providers: [provideRouter([])]
    }).compileComponents();
  });

  it('creates the admin dashboard shell', () => {
    const fixture = TestBed.createComponent(AdminDashboardComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('BeeAdmin');
    expect(fixture.componentInstance.activeTab).toBe('dashboard');
  });

  it('switches tabs and updates the visible section title', () => {
    const fixture = TestBed.createComponent(AdminDashboardComponent);
    fixture.detectChanges();

    const buttons = Array.from(fixture.nativeElement.querySelectorAll('button')) as HTMLButtonElement[];
    const marketingButton = buttons.find((button) => button.textContent?.includes('Content & PR'));

    marketingButton?.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.activeTab).toBe('marketing');
    expect(fixture.nativeElement.textContent).toContain('Marketing & Content');
    expect(fixture.nativeElement.textContent).toContain('Coupons');
  });
});
