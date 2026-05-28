import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthFacade } from '@/features/auth/data-access/auth.facade';
import { CheckoutFacade, type CheckoutPaymentMethod } from '@/features/checkout/data-access/checkout.facade';
import { WalletFacade } from '@/features/commerce/data-access/wallet.facade';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="min-h-[70vh] bg-cream py-12">
      <div class="container mx-auto px-4 grid lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 bg-white rounded-xl shadow p-6 space-y-6">
          <div class="flex items-start justify-between gap-4">
            <div>
              <h1 class="text-3xl font-bold text-charcoal">Thanh toán</h1>
              <p class="text-sm text-gray-500 mt-2">Hoàn tất thông tin giao hàng và chọn phương thức thanh toán phù hợp.</p>
            </div>
            @if (!authFacade.isAuthenticated()) {
              <a routerLink="/login" class="text-sm font-semibold text-honey hover:underline">Đăng nhập để đặt hàng</a>
            }
          </div>

          <div class="space-y-4">
            <h2 class="text-lg font-bold">Thông tin giao hàng</h2>

            @if (savedAddresses().length > 0) {
              <div class="rounded-lg border border-gray-200 bg-[#fcfbf8] p-4 space-y-3">
                <label class="block text-sm font-semibold text-charcoal">Địa chỉ đã lưu</label>
                <select [(ngModel)]="selectedAddressId" class="w-full border rounded-lg px-3 py-2">
                  <option value="">Nhập địa chỉ mới</option>
                  @for (address of savedAddresses(); track address.id) {
                    <option [value]="address.id">
                      {{ address.fullName }} - {{ address.phone }} - {{ formatAddress(address) }}
                    </option>
                  }
                </select>

                @if (selectedAddress()) {
                  <div class="rounded-lg border border-honey/30 bg-white p-3 text-sm text-gray-700">
                    <p class="font-semibold text-charcoal">{{ selectedAddress()?.fullName }} - {{ selectedAddress()?.phone }}</p>
                    <p class="mt-1">{{ selectedAddressLabel() }}</p>
                  </div>
                }
              </div>
            }

            @if (!usingSavedAddress()) {
              <div class="grid md:grid-cols-2 gap-3">
                <input [(ngModel)]="fullName" placeholder="Họ tên người nhận" class="border rounded-lg px-3 py-2">
                <input [(ngModel)]="phone" placeholder="Số điện thoại" class="border rounded-lg px-3 py-2">
                <div class="md:col-span-2 relative">
                  <input [(ngModel)]="line1" placeholder="Địa chỉ (số nhà, đường...)" class="border rounded-lg px-3 py-2 w-full"
                    list="addressSuggestions">
                  <datalist id="addressSuggestions">
                    <option value="123 Nguyễn Huệ, Phường Bến Nghé"></option>
                    <option value="45 Lê Lợi, Phường Bến Thành"></option>
                    <option value="78 Trần Hưng Đạo, Phường Cầu Ông Lãnh"></option>
                    <option value="201 Hai Bà Trưng, Phường 6"></option>
                    <option value="55 Nguyễn Trãi, Phường Nguyễn Cư Trinh"></option>
                  </datalist>
                </div>
                <div class="relative">
                  <input [(ngModel)]="ward" placeholder="Phường / Xã" class="border rounded-lg px-3 py-2 w-full"
                    list="wardSuggestions">
                  <datalist id="wardSuggestions">
                    <option value="Phường Bến Nghé"></option>
                    <option value="Phường Bến Thành"></option>
                    <option value="Phường Nguyễn Cư Trinh"></option>
                    <option value="Phường Cầu Ông Lãnh"></option>
                    <option value="Phường Phạm Ngũ Lão"></option>
                    <option value="Phường Tân Định"></option>
                    <option value="Phường Đa Kao"></option>
                  </datalist>
                </div>
                <div class="relative">
                  <input [(ngModel)]="district" placeholder="Quận / Huyện" class="border rounded-lg px-3 py-2 w-full"
                    list="districtSuggestions">
                  <datalist id="districtSuggestions">
                    <option value="Quận 1"></option>
                    <option value="Quận 2 (Thủ Đức)"></option>
                    <option value="Quận 3"></option>
                    <option value="Quận 5"></option>
                    <option value="Quận 7"></option>
                    <option value="Quận 10"></option>
                    <option value="Quận Bình Thạnh"></option>
                    <option value="Quận Gò Vấp"></option>
                    <option value="Quận Tân Bình"></option>
                    <option value="Quận Phú Nhuận"></option>
                  </datalist>
                </div>
                <div class="md:col-span-2 relative">
                  <input [(ngModel)]="city" placeholder="Tỉnh / Thành phố" class="border rounded-lg px-3 py-2 w-full"
                    list="citySuggestions">
                  <datalist id="citySuggestions">
                    <option value="TP. Hồ Chí Minh"></option>
                    <option value="Hà Nội"></option>
                    <option value="Đà Nẵng"></option>
                    <option value="Hải Phòng"></option>
                    <option value="Cần Thơ"></option>
                    <option value="Bình Dương"></option>
                    <option value="Đồng Nai"></option>
                  </datalist>
                </div>
              </div>
            }

            <textarea [(ngModel)]="notes" rows="3" placeholder="Ghi chú giao hàng (không bắt buộc)" class="border rounded-lg px-3 py-2 w-full"></textarea>
          </div>

          <div>
            <h2 class="text-lg font-bold mb-3">Sản phẩm trong giỏ</h2>
            @if (cartItemsDetailed().length === 0) {
              <p class="text-sm text-gray-500">Giỏ hàng hiện đang trống.</p>
            } @else {
              <div class="space-y-2">
                @for (item of cartItemsDetailed(); track item.id) {
                  <div class="border rounded-lg p-3 flex justify-between items-center">
                    <div>
                      <p class="font-semibold">{{ item.name }}</p>
                      <p class="text-sm text-gray-500">SL: {{ item.quantity }}</p>
                    </div>
                    <p class="font-bold">{{ item.lineTotal | currency:'VND':'symbol':'1.0-0' }}</p>
                  </div>
                }
              </div>
            }
          </div>

          <div>
            <h2 class="text-lg font-bold mb-3">Phương thức thanh toán</h2>
            <div class="flex flex-col gap-2">
              <label class="border rounded-lg p-3 cursor-pointer flex items-center gap-3"
                     [class]="paymentMethod === 'wallet' ? 'border-amber-400 bg-amber-50' : 'border-gray-200'">
                <input type="radio" name="payment" [(ngModel)]="paymentMethod" value="wallet">
                <div class="flex-1">
                  <span class="font-semibold text-amber-700">Thanh toán bằng ví</span>
                  <span class="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">
                    {{ walletFacade.balance() | currency:'VND':'symbol':'1.0-0' }}
                  </span>
                  @if (walletFacade.balance() < grandTotal() && paymentMethod === 'wallet') {
                    <p class="text-xs text-red-500 mt-1">Số dư không đủ. Cần thêm: {{ (grandTotal() - walletFacade.balance()) | currency:'VND':'symbol':'1.0-0' }}</p>
                  }
                </div>
              </label>
              <label class="border rounded-lg p-3 cursor-pointer" [class]="paymentMethod === 'cod' ? 'border-amber-400 bg-amber-50' : 'border-gray-200'">
                <input type="radio" name="payment" [(ngModel)]="paymentMethod" value="cod"> Thanh toán khi nhận hàng (COD)
              </label>
              <label class="border rounded-lg p-3 cursor-pointer" [class]="paymentMethod === 'bank' ? 'border-amber-400 bg-amber-50' : 'border-gray-200'">
                <input type="radio" name="payment" [(ngModel)]="paymentMethod" value="bank"> Chuyển khoản ngân hàng
              </label>
            </div>
          </div>
        </div>

        <aside class="bg-white rounded-xl shadow p-6 h-fit space-y-4">
          <h2 class="text-xl font-bold">Tóm tắt đơn hàng</h2>

          <div class="space-y-1 text-sm">
            <div class="flex justify-between"><span>Tạm tính</span><span>{{ subtotal() | currency:'VND':'symbol':'1.0-0' }}</span></div>
            <div class="flex justify-between"><span>Phí ship</span><span>{{ shippingFee() | currency:'VND':'symbol':'1.0-0' }}</span></div>
            <hr>
            <div class="flex justify-between text-base font-bold"><span>Tổng cộng</span><span>{{ grandTotal() | currency:'VND':'symbol':'1.0-0' }}</span></div>
          </div>

          <button
            class="w-full bg-honey text-charcoal font-bold py-3 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed"
            [disabled]="isSubmitting() || cartItemsDetailed().length === 0"
            (click)="placeOrder()">
            {{ isSubmitting() ? 'Đang xử lý...' : 'Đặt hàng' }}
          </button>

          <a routerLink="/orders" class="block text-center text-sm text-gray-500 hover:text-charcoal">Xem và theo dõi đơn hàng</a>

          @if (statusMessage()) {
            <p class="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-2">{{ statusMessage() }}</p>
          }

          @if (errorMessage()) {
            <p class="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-2">{{ errorMessage() }}</p>
          }
        </aside>
      </div>
    </section>
  `
})
export class CheckoutComponent implements OnInit {
  readonly authFacade = inject(AuthFacade);
  private readonly checkoutFacade = inject(CheckoutFacade);
  private readonly router = inject(Router);
  readonly walletFacade = inject(WalletFacade);

  readonly cartItemsDetailed = this.checkoutFacade.cartItemsDetailed;
  readonly subtotal = this.checkoutFacade.subtotal;
  readonly shippingFee = this.checkoutFacade.shippingFee;
  readonly savedAddresses = this.authFacade.addresses;
  readonly selectedAddress = computed(() => {
    const selectedId = Number(this.selectedAddressId);
    return this.savedAddresses().find((address) => address.id === selectedId) ?? null;
  });

  fullName = '';
  phone = '';
  line1 = '';
  ward = '';
  district = '';
  city = '';
  notes = '';
  paymentMethod: CheckoutPaymentMethod = 'wallet';
  selectedAddressId = '';

  statusMessage = signal('');
  errorMessage = signal('');
  isSubmitting = signal(false);
  readonly grandTotal = computed(() => this.subtotal() + this.shippingFee());

  ngOnInit() {
    this.walletFacade.loadWallet();
  }

  usingSavedAddress(): boolean {
    return this.selectedAddress() !== null;
  }

  formatAddress(address: {
    line1: string;
    ward: string;
    district: string;
    city: string;
  }): string {
    return [address.line1, address.ward, address.district, address.city].filter(Boolean).join(', ');
  }

  selectedAddressLabel(): string {
    return this.selectedAddress() ? this.formatAddress(this.selectedAddress()!) : '';
  }

  placeOrder(): void {
    if (this.isSubmitting()) {
      return;
    }

    if (!this.authFacade.isAuthenticated()) {
      this.errorMessage.set('Vui lòng đăng nhập trước khi đặt hàng.');
      this.statusMessage.set('');
      return;
    }

    if (!this.hasShippingInformation()) {
      this.errorMessage.set('Vui lòng nhập đầy đủ thông tin giao hàng hoặc chọn địa chỉ đã lưu.');
      this.statusMessage.set('');
      return;
    }

    this.errorMessage.set('');
    this.statusMessage.set('');

    if (this.paymentMethod === 'wallet' && this.walletFacade.balance() < this.grandTotal()) {
      this.errorMessage.set('Số dư ví không đủ để thanh toán. Vui lòng nạp thêm tiền hoặc chọn phương thức khác.');
      return;
    }

    this.isSubmitting.set(true);

    this.checkoutFacade.placeOrder({
      addressId: this.selectedAddress() ? Number(this.selectedAddressId) : null,
      fullName: this.fullName,
      phone: this.phone,
      line1: this.line1,
      ward: this.ward,
      district: this.district,
      city: this.city,
      notes: this.notes,
      paymentMethod: this.paymentMethod
    }).subscribe({
      next: (result) => {
        this.isSubmitting.set(false);

        if (result.kind === 'redirect') {
          this.statusMessage.set('Đang chuyển sang VNPay...');
          window.location.assign(result.redirectUrl);
          return;
        }

        if (result.kind === 'success') {
          this.statusMessage.set(result.message);
          this.errorMessage.set('');
          this.router.navigate(['/orders'], {
            queryParams: {
              payment: 'processed'
            }
          });
          return;
        }

        this.errorMessage.set(result.message);
      },
      error: () => {
        this.isSubmitting.set(false);
        this.errorMessage.set('Không thể đặt hàng lúc này.');
      }
    });
  }

  private hasShippingInformation(): boolean {
    if (this.usingSavedAddress()) {
      return true;
    }

    return [this.fullName, this.phone, this.line1, this.ward, this.district, this.city]
      .every((value) => value.trim().length > 0);
  }
}
