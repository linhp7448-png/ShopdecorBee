import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthFacade } from '@/features/auth/data-access/auth.facade';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (registerState$ | async; as registerState) {
      <section class="min-h-[70vh] bg-cream py-16">
        <div class="container mx-auto px-4 max-w-xl">
          <div class="bg-white rounded-2xl shadow p-8 border border-gray-100">
            <h1 class="text-3xl font-bold text-charcoal mb-6">Đăng ký</h1>

            @if (!registerState.isRegistered) {
              <form class="space-y-4" (ngSubmit)="submitRegister()">
                <div>
                  <label class="text-sm font-semibold text-charcoal">Họ tên</label>
                  <input [(ngModel)]="fullName" name="fullName" class="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2" type="text" required>
                </div>
                <div>
                  <label class="text-sm font-semibold text-charcoal">Email</label>
                  <input [(ngModel)]="email" name="email" class="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2" type="email" required>
                </div>
                <div>
                  <label class="text-sm font-semibold text-charcoal">Số điện thoại</label>
                  <input [(ngModel)]="phone" name="phone" class="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2" type="text">
                </div>
                <div>
                  <label class="text-sm font-semibold text-charcoal">Mật khẩu</label>
                  <input [(ngModel)]="password" name="password" class="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2" type="password" required>
                </div>

                @if (registerState.errorMessage) {
                  <div class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {{ registerState.errorMessage }}
                  </div>
                }

                <button class="w-full bg-charcoal text-white py-3 rounded-lg font-bold hover:bg-honey hover:text-charcoal transition-colors" type="submit" [disabled]="registerState.isSubmitting">
                  {{ registerState.isSubmitting ? 'Đang đăng ký...' : 'Đăng ký' }}
                </button>

                <p class="text-center text-sm text-gray-600 mt-4">
                  Đã có tài khoản? <a routerLink="/login" class="text-charcoal font-bold hover:underline">Đăng nhập</a>
                </p>
              </form>
            } @else {
              <div class="text-center space-y-4">
                <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
                  <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 8"></path></svg>
                </div>
                <h2 class="text-2xl font-bold text-charcoal">Đăng ký thành công!</h2>
                <p class="text-gray-600">Tài khoản của bạn đã được tạo, bạn có thể đăng nhập ngay bây giờ.</p>
                <a routerLink="/login" class="inline-block bg-honey text-charcoal px-6 py-3 rounded-lg font-bold shadow-md hover:bg-charcoal hover:text-white transition-all">Đến trang Đăng nhập</a>
              </div>
            }
          </div>
        </div>
      </section>
    }
  `
})
export class RegisterComponent implements OnInit {
  readonly authFacade = inject(AuthFacade);
  readonly registerState$ = this.authFacade.registerState$;

  fullName = '';
  email = '';
  phone = '';
  password = '';

  ngOnInit(): void {
    this.authFacade.resetRegisterFlow();
  }

  submitRegister(): void {
    if (!this.email || !this.password || !this.fullName) {
      return;
    }

    this.authFacade.submitRegister({
      fullName: this.fullName,
      email: this.email,
      phone: this.phone,
      password: this.password,
      role: 'customer'
    });
  }
}
