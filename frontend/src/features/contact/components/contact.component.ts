import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ContactFacade } from '@/features/contact/data-access/contact.facade';

interface Branch {
  id: string;
  city: string;
  flag: string;
  name: string;
  address: string;
  phone: string;
  hours: string;
  mapSrc: SafeResourceUrl;
}

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="bg-cream min-h-screen py-12">
      <div class="container mx-auto px-4 space-y-8">
        <div>
          <h1 class="text-3xl font-bold text-charcoal">Liên hệ &amp; Feedback</h1>
          <p class="text-gray-600 mt-1">Gửi thông tin để BeeShop hỗ trợ nhanh nhất.</p>
        </div>

        <div class="grid lg:grid-cols-2 gap-8">
          <!-- Feedback Form -->
          <div class="bg-white rounded-xl shadow p-6">
            <h2 class="text-xl font-bold mb-4">Gửi feedback</h2>
            <form class="space-y-3" (ngSubmit)="submit()">
              <input [(ngModel)]="name" name="name" placeholder="Họ tên" class="w-full border border-gray-300 rounded-lg px-3 py-2" required>
              <input [(ngModel)]="email" name="email" placeholder="Email" class="w-full border border-gray-300 rounded-lg px-3 py-2" type="email" required>
              <textarea [(ngModel)]="message" name="message" placeholder="Nội dung" class="w-full border border-gray-300 rounded-lg px-3 py-2 h-28" required></textarea>
              
              <div class="flex items-center gap-3">
                <button 
                  class="bg-charcoal text-white px-6 py-2 rounded-lg font-semibold hover:bg-honey hover:text-charcoal transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2" 
                  type="submit"
                  [disabled]="isSubmitting()"
                >
                  @if (isSubmitting()) {
                    <span class="animate-spin text-lg">&#9202;</span>
                    Đang gửi...
                  } @else {
                    Gửi feedback
                  }
                </button>

                @if (showSuccess()) {
                  <p class="text-green-600 font-medium animate-bounce">✓ Gửi thành công!</p>
                }
              </div>

              @if (errorMessage()) {
                <p class="text-red-600 text-sm mt-1 bg-red-50 p-2 rounded border border-red-100 italic">
                  ⚠ {{ errorMessage() }}
                </p>
              }
            </form>
          </div>

          <!-- Google Maps - 4 Chi Nhanh -->
          <div class="bg-white rounded-xl shadow p-6 space-y-4">
            <h2 class="text-xl font-bold">Hệ thống chi nhánh</h2>

            <!-- Branch Tabs -->
            <div class="flex flex-wrap gap-2">
              @for (branch of branches; track branch.id) {
                <button
                  (click)="activeBranch = branch.id"
                  class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border transition-all duration-200"
                  [class.bg-honey]="activeBranch === branch.id"
                  [class.text-charcoal]="activeBranch === branch.id"
                  [class.border-honey]="activeBranch === branch.id"
                  [class.bg-white]="activeBranch !== branch.id"
                  [class.text-gray-500]="activeBranch !== branch.id"
                  [class.border-gray-200]="activeBranch !== branch.id"
                >
                  <span>{{ branch.flag }}</span>
                  <span>{{ branch.city }}</span>
                </button>
              }
            </div>

            <!-- Branch Detail -->
            @for (branch of branches; track branch.id) {
              @if (activeBranch === branch.id) {
                <div class="space-y-3">
                  <iframe
                    [title]="'beeshop-' + branch.id"
                    class="w-full h-56 rounded-xl border border-gray-100 shadow-sm"
                    [src]="branch.mapSrc"
                    loading="lazy"
                    allowfullscreen
                    referrerpolicy="no-referrer-when-downgrade">
                  </iframe>
                  <div class="bg-cream rounded-lg p-3 space-y-1.5">
                    <p class="font-bold text-charcoal text-sm flex items-center gap-2">
                      <span class="text-honey text-base">&#128205;</span> {{ branch.name }}
                    </p>
                    <p class="text-sm text-gray-600 pl-6">{{ branch.address }}</p>
                    <div class="flex flex-wrap gap-x-6 gap-y-1 pl-6 text-sm text-gray-500">
                      <span>&#128222; {{ branch.phone }}</span>
                      <span>&#128336; {{ branch.hours }}</span>
                    </div>
                  </div>
                </div>
              }
            }
          </div>
        </div>

        <!-- Feedback List -->
        <div class="bg-white rounded-xl shadow p-6">
          <h2 class="text-xl font-bold mb-4">Danh sách feedback</h2>
          <div class="space-y-3">
            @for (item of contactFacade.feedbackList(); track item.feedbackId) {
              <div class="border border-gray-200 rounded-lg p-3">
                <div class="flex justify-between">
                  <p class="font-semibold text-charcoal">{{ item.name }}</p>
                  <p class="text-xs text-gray-500">{{ item.createdAt | date:'dd/MM/yyyy HH:mm' }}</p>
                </div>
                <p class="text-xs text-gray-500 mb-2">{{ item.email }}</p>
                <p class="text-sm text-gray-700 leading-relaxed">{{ item.message }}</p>

                @if (item.adminReply) {
                  <div class="mt-3 ml-4 pl-4 border-l-2 border-honey/30 bg-gray-50 p-2 rounded-r-lg">
                    <p class="text-[10px] font-black text-honey uppercase mb-1">BeeShop Admin trả lời:</p>
                    <p class="text-sm text-gray-800 font-medium">{{ item.adminReply }}</p>
                    <p class="text-[10px] text-gray-400 mt-1 italic">{{ item.repliedAt | date:'dd/MM/yyyy' }}</p>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      </div>
    </section>
  `
})
export class ContactComponent {
  contactFacade = inject(ContactFacade);
  private sanitizer = inject(DomSanitizer);

  name = '';
  email = '';
  message = '';
  activeBranch = 'hanoi';

  isSubmitting = signal(false);
  showSuccess = signal(false);
  errorMessage = signal<string | null>(null);

  branches: Branch[] = [
    {
      id: 'hanoi',
      city: 'Hà Nội',
      flag: '🏛️',
      name: 'BeeShop Hà Nội',
      address: '54 Hàng Gai, phường Hàng Gai, quận Hoàn Kiếm, Hà Nội',
      phone: '024 3826 1234',
      hours: '8:00 – 21:30',
      mapSrc: this.sanitizer.bypassSecurityTrustResourceUrl(
        'https://maps.google.com/maps?q=54+Hang+Gai,+Hoan+Kiem,+Ha+Noi,+Vietnam&t=&z=16&ie=UTF8&iwloc=&output=embed'
      )
    },
    {
      id: 'hcm',
      city: 'TP.HCM',
      flag: '🏙️',
      name: 'BeeShop TP. Hồ Chí Minh',
      address: '68 Lê Lợi, phường Bến Nghé, quận 1, TP. Hồ Chí Minh',
      phone: '028 3829 5678',
      hours: '8:00 – 22:00',
      mapSrc: this.sanitizer.bypassSecurityTrustResourceUrl(
        'https://maps.google.com/maps?q=68+Le+Loi,+Ben+Nghe,+District+1,+Ho+Chi+Minh+City,+Vietnam&t=&z=16&ie=UTF8&iwloc=&output=embed'
      )
    },
    {
      id: 'danang',
      city: 'Đà Nẵng',
      flag: '🌊',
      name: 'BeeShop Đà Nẵng',
      address: '112 Bạch Đằng, phường Thạch Thang, quận Hải Châu, Đà Nẵng',
      phone: '0236 3822 999',
      hours: '8:30 – 21:00',
      mapSrc: this.sanitizer.bypassSecurityTrustResourceUrl(
        'https://maps.google.com/maps?q=112+Bach+Dang,+Hai+Chau,+Da+Nang,+Vietnam&t=&z=16&ie=UTF8&iwloc=&output=embed'
      )
    },
    {
      id: 'haiphong',
      city: 'Hải Phòng',
      flag: '⚓',
      name: 'BeeShop Hải Phòng',
      address: '35 Điện Biên Phủ, phường Minh Khai, quận Hồng Bàng, Hải Phòng',
      phone: '0225 3745 888',
      hours: '8:00 – 21:00',
      mapSrc: this.sanitizer.bypassSecurityTrustResourceUrl(
        'https://maps.google.com/maps?q=35+Dien+Bien+Phu,+Hong+Bang,+Hai+Phong,+Vietnam&t=&z=16&ie=UTF8&iwloc=&output=embed'
      )
    }
  ];

  submit(): void {
    if (!this.name || !this.email || !this.message) return;

    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    this.showSuccess.set(false);

    this.contactFacade.submitFeedback(this.name, this.email, this.message).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.showSuccess.set(true);
        this.name = '';
        this.email = '';
        this.message = '';
        
        // Hide success message after 5 seconds
        setTimeout(() => this.showSuccess.set(false), 5000);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set('Không thể gửi feedback. Vui lòng kiểm tra lại kết nối!');
        console.error('Feedback error:', err);
      }
    });
  }
}
