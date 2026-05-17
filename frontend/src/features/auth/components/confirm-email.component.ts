import { Component, ChangeDetectionStrategy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthFacade } from '@/features/auth/data-access/auth.facade';

@Component({
  selector: 'app-confirm-email',
  standalone: true,
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (confirmEmailState$ | async; as confirmEmailState) {
      <section class="min-h-[70vh] bg-cream py-16 flex items-center justify-center">
        <div class="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">

          @if (confirmEmailState.isLoading) {
            <div class="space-y-4">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-honey mx-auto"></div>
              <p class="text-gray-600 font-medium">Đang xác thực tài khoản...</p>
            </div>
          } @else {
            <div class="space-y-5">
              <div class="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                   [ngClass]="confirmEmailState.isSuccess ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'">
                @if (confirmEmailState.isSuccess) {
                  <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 8"></path></svg>
                } @else {
                  <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                }
              </div>

              <h1 class="text-2xl font-black text-charcoal">{{ confirmEmailState.isSuccess ? 'Thành công!' : 'Thất bại!' }}</h1>
              <p class="text-gray-600 font-medium">{{ confirmEmailState.message }}</p>

              <div class="pt-4">
                <a routerLink="/login" class="inline-block bg-honey text-charcoal px-6 py-3 rounded-xl font-bold hover:bg-charcoal hover:text-white transition-all shadow-md">
                  Đến trang Đăng nhập
                </a>
              </div>
            </div>
          }

        </div>
      </section>
    }
  `
})
export class ConfirmEmailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly authFacade = inject(AuthFacade);

  readonly confirmEmailState$ = this.authFacade.confirmEmailState$;

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    this.authFacade.initializeConfirmEmailFlow(token);
  }
}
