import { Component, ChangeDetectionStrategy, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

type PolicyTab = 'privacy' | 'shipping' | 'return' | 'payment';

interface PolicySection {
  icon: string;
  title: string;
  items: string[];
}

interface PolicyData {
  id: PolicyTab;
  label: string;
  emoji: string;
  heroIcon: string;
  heroColor: string;
  subtitle: string;
  lastUpdated: string;
  sections: PolicySection[];
}

@Component({
  selector: 'app-policies',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Hero Banner -->
    <section class="relative bg-charcoal-dark overflow-hidden">
      <div class="hero-bg-pattern absolute inset-0 opacity-10"></div>
      <div class="absolute inset-0 bg-gradient-to-br from-honey/20 via-transparent to-honey/5"></div>
      <!-- Floating hexagons -->
      <div class="absolute top-6 right-10 w-16 h-16 border-2 border-honey/20 rotate-12 rounded-xl float-anim" style="animation-delay:0s"></div>
      <div class="absolute bottom-4 left-20 w-10 h-10 bg-honey/10 rotate-45 rounded-md float-anim" style="animation-delay:1s"></div>
      <div class="absolute top-1/2 right-1/4 w-8 h-8 border border-honey/15 rounded-full float-anim" style="animation-delay:2s"></div>
      
      <div class="relative container mx-auto px-4 py-16 md:py-20 text-center">
        <div class="inline-flex items-center gap-2 bg-honey/15 border border-honey/30 rounded-full px-4 py-2 text-honey text-sm font-semibold mb-5 backdrop-blur-sm">
          <span>🐝</span>
          <span>BeeShop – Cam kết minh bạch</span>
        </div>
        <h1 class="text-3xl md:text-5xl font-extrabold text-white mb-3 leading-tight">
          Chính sách
          <span class="text-honey relative">
            của chúng tôi
            <svg class="absolute -bottom-1 left-0 w-full" viewBox="0 0 200 8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 6 Q50 2 100 5 Q150 8 198 3" stroke="#F6C324" stroke-width="2.5" stroke-linecap="round" fill="none"/>
            </svg>
          </span>
        </h1>
        <p class="text-gray-400 text-base md:text-lg max-w-xl mx-auto mt-3">
          Chúng tôi đặt sự tin tưởng và quyền lợi của bạn lên hàng đầu. Dưới đây là những cam kết rõ ràng từ BeeShop.
        </p>
      </div>
    </section>

    <!-- Tab Navigation -->
    <div class="sticky top-[57px] z-40 bg-white border-b border-gray-200 shadow-sm">
      <div class="container mx-auto px-4">
        <div class="flex overflow-x-auto no-scrollbar gap-0">
          @for (tab of policies; track tab.id) {
            <button
              (click)="setActiveTab(tab.id)"
              class="tab-btn flex items-center gap-2 px-4 md:px-6 py-4 text-sm font-bold whitespace-nowrap border-b-2 transition-all duration-300 flex-shrink-0"
              [class.active-tab]="activeTab() === tab.id"
              [class.inactive-tab]="activeTab() !== tab.id"
            >
              <span class="text-lg">{{ tab.emoji }}</span>
              <span class="hidden sm:inline">{{ tab.label }}</span>
              <span class="inline sm:hidden text-xs">{{ tab.label.split(' ')[0] }}</span>
            </button>
          }
        </div>
      </div>
    </div>

    <!-- Policy Content -->
    <section class="bg-cream min-h-screen py-12">
      <div class="container mx-auto px-4 max-w-5xl">
        @if (activePolicy(); as policy) {
          <!-- Content Card Header -->
          <div class="policy-card bg-white rounded-2xl shadow-lg overflow-hidden mb-8 animate-fadein">
            <div class="policy-hero-bar h-2" [style.background]="policy.heroColor"></div>
            <div class="p-6 md:p-10 flex flex-col md:flex-row items-start md:items-center gap-6">
              <div class="policy-icon-wrap flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center text-3xl md:text-4xl shadow-lg"
                   [style.background]="policy.heroColor + '22'">
                <span>{{ policy.emoji }}</span>
              </div>
              <div class="flex-grow">
                <div class="flex flex-wrap items-center gap-3 mb-1">
                  <h2 class="text-2xl md:text-3xl font-extrabold text-charcoal">{{ policy.label }}</h2>
                  <span class="bg-honey/15 text-honey text-xs font-bold px-3 py-1 rounded-full border border-honey/25">
                    Cập nhật: {{ policy.lastUpdated }}
                  </span>
                </div>
                <p class="text-gray-500 text-sm md:text-base">{{ policy.subtitle }}</p>
              </div>
            </div>
          </div>

          <!-- Sections Grid -->
          <div class="grid md:grid-cols-2 gap-6">
            @for (section of policy.sections; track section.title; let i = $index) {
              <div class="section-card bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fadein hover:shadow-md transition-shadow duration-300"
                   [style.animation-delay]="(i * 0.08) + 's'">
                <div class="section-header flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-cream to-white">
                  <span class="text-xl">{{ section.icon }}</span>
                  <h3 class="font-bold text-charcoal text-base">{{ section.title }}</h3>
                </div>
                <ul class="p-6 space-y-3">
                  @for (item of section.items; track item) {
                    <li class="flex items-start gap-3 text-sm text-gray-700 leading-relaxed policy-item">
                      <span class="flex-shrink-0 w-5 h-5 bg-honey/15 rounded-full flex items-center justify-center mt-0.5">
                        <svg class="w-3 h-3 text-honey" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                        </svg>
                      </span>
                      <span>{{ item }}</span>
                    </li>
                  }
                </ul>
              </div>
            }
          </div>

          <!-- Contact CTA -->
          <div class="mt-10 bg-gradient-to-br from-charcoal-dark to-charcoal rounded-2xl p-8 md:p-10 text-center relative overflow-hidden animate-fadein">
            <div class="absolute inset-0 opacity-5 hero-bg-pattern"></div>
            <div class="absolute top-3 right-6 w-12 h-12 border border-honey/20 rounded-xl rotate-12 float-anim"></div>
            <div class="absolute bottom-4 left-8 w-8 h-8 bg-honey/10 rotate-45 rounded float-anim" style="animation-delay:1.5s"></div>
            <div class="relative">
              <div class="w-14 h-14 bg-honey rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-honey/30">
                <span class="text-2xl">🐝</span>
              </div>
              <h3 class="text-white text-xl md:text-2xl font-extrabold mb-2">Cần hỗ trợ thêm?</h3>
              <p class="text-gray-400 text-sm mb-6 max-w-md mx-auto">
                Đội ngũ BeeShop luôn sẵn sàng hỗ trợ bạn 7 ngày / tuần. Liên hệ ngay để được giải đáp nhanh nhất!
              </p>
              <div class="flex flex-wrap justify-center gap-3">
                <a (click)="goContact($event)" href="#"
                   class="inline-flex items-center gap-2 bg-honey hover:bg-honey-light text-charcoal font-bold px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg shadow-honey/25 cursor-pointer">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
                  </svg>
                  Liên hệ ngay
                </a>
                <a href="tel:19006688"
                   class="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3 rounded-xl transition-all duration-300 border border-white/20 hover:border-white/40 cursor-pointer">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                  </svg>
                  1900 6688
                </a>
              </div>
            </div>
          </div>
        }
      </div>
    </section>
  `,
  styles: [`
    /* ═══════════════════════════════════════════ */
    /* BACKGROUND PATTERN                         */
    /* ═══════════════════════════════════════════ */
    .hero-bg-pattern {
      background-image:
        radial-gradient(circle at 2px 2px, rgba(246,195,36,0.3) 1px, transparent 0);
      background-size: 32px 32px;
    }

    /* ═══════════════════════════════════════════ */
    /* FLOATING ANIMATION                         */
    /* ═══════════════════════════════════════════ */
    .float-anim {
      animation: floatUpDown 4s ease-in-out infinite;
    }
    @keyframes floatUpDown {
      0%, 100% { transform: translateY(0) rotate(12deg); }
      50% { transform: translateY(-10px) rotate(15deg); }
    }

    /* ═══════════════════════════════════════════ */
    /* TABS                                        */
    /* ═══════════════════════════════════════════ */
    .active-tab {
      color: #F6C324;
      border-bottom-color: #F6C324;
      background: linear-gradient(to bottom, rgba(246,195,36,0.06), transparent);
    }
    .inactive-tab {
      color: #888;
      border-bottom-color: transparent;
    }
    .inactive-tab:hover {
      color: #333;
      border-bottom-color: #e5e5e5;
    }
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

    /* ═══════════════════════════════════════════ */
    /* FADE IN ANIMATION                          */
    /* ═══════════════════════════════════════════ */
    .animate-fadein {
      animation: fadeSlideIn 0.45s cubic-bezier(0.4, 0, 0.2, 1) both;
    }
    @keyframes fadeSlideIn {
      from { opacity: 0; transform: translateY(18px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* ═══════════════════════════════════════════ */
    /* POLICY ITEM HOVER                          */
    /* ═══════════════════════════════════════════ */
    .policy-item {
      transition: transform 0.2s ease;
    }
    .policy-item:hover {
      transform: translateX(4px);
    }

    /* ═══════════════════════════════════════════ */
    /* HERO BAR SHIMMER                           */
    /* ═══════════════════════════════════════════ */
    .policy-hero-bar {
      position: relative;
      overflow: hidden;
    }
    .policy-hero-bar::after {
      content: '';
      position: absolute;
      top: 0; left: -100%; width: 60%; height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent);
      animation: shimmerBar 3s ease-in-out infinite;
    }
    @keyframes shimmerBar {
      0%   { left: -100%; }
      60%  { left: 150%; }
      100% { left: 150%; }
    }
  `]
})
export class PoliciesComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  ngOnInit() {
    this.route.fragment.subscribe(fragment => {
      const validTabs: PolicyTab[] = ['privacy', 'shipping', 'return', 'payment'];
      if (fragment && validTabs.includes(fragment as PolicyTab)) {
        this.activeTab.set(fragment as PolicyTab);
      }
    });
  }

  activeTab = signal<PolicyTab>('privacy');

  policies: PolicyData[] = [
    {
      id: 'privacy',
      label: 'Chính sách bảo mật',
      emoji: '🔒',
      heroIcon: 'shield',
      heroColor: '#6366f1',
      subtitle: 'Chúng tôi bảo vệ thông tin cá nhân của bạn với tiêu chuẩn cao nhất.',
      lastUpdated: '01/01/2026',
      sections: [
        {
          icon: '📋',
          title: 'Thông tin chúng tôi thu thập',
          items: [
            'Họ tên, địa chỉ email và số điện thoại khi bạn đăng ký tài khoản hoặc đặt hàng.',
            'Địa chỉ giao hàng và thông tin thanh toán cần thiết để xử lý đơn hàng.',
            'Dữ liệu hành vi duyệt web (cookies, log truy cập) để cải thiện trải nghiệm.',
            'Phản hồi, đánh giá sản phẩm và nội dung bạn chủ động cung cấp.'
          ]
        },
        {
          icon: '🎯',
          title: 'Mục đích sử dụng thông tin',
          items: [
            'Xử lý đơn hàng, xác nhận giao dịch và giao hàng đúng địa chỉ.',
            'Gửi thông báo trạng thái đơn hàng, khuyến mãi (nếu bạn đồng ý).',
            'Cá nhân hóa gợi ý sản phẩm và cải thiện giao diện.',
            'Phân tích xu hướng mua sắm tổng hợp để nâng cao dịch vụ.'
          ]
        },
        {
          icon: '🛡️',
          title: 'Cam kết bảo mật dữ liệu',
          items: [
            'Toàn bộ dữ liệu được mã hóa SSL/TLS trong quá trình truyền tải.',
            'Thông tin thanh toán được xử lý qua cổng bảo mật PCI-DSS đạt chuẩn.',
            'Chúng tôi không bán hoặc chia sẻ thông tin cá nhân cho bên thứ ba vì mục đích thương mại.',
            'Hệ thống được kiểm tra bảo mật định kỳ và cập nhật thường xuyên.'
          ]
        },
        {
          icon: '⚙️',
          title: 'Quyền của bạn',
          items: [
            'Yêu cầu xem, chỉnh sửa hoặc xóa thông tin cá nhân bất kỳ lúc nào.',
            'Hủy đăng ký nhận email marketing qua liên kết trong mỗi email.',
            'Yêu cầu hạn chế xử lý dữ liệu trong các trường hợp cụ thể.',
            'Khiếu nại với cơ quan bảo vệ dữ liệu nếu có tranh chấp.'
          ]
        },
        {
          icon: '🍪',
          title: 'Chính sách Cookie',
          items: [
            'Cookie giỏ hàng được sử dụng để lưu sản phẩm bạn đã chọn.',
            'Cookie phân tích (Google Analytics) theo dõi hành vi tổng hợp ẩn danh.',
            'Bạn có thể tắt cookie trong trình duyệt, tuy nhiên một số tính năng có thể bị ảnh hưởng.',
            'Cookie được lưu tối đa 365 ngày và có thể xóa bất kỳ lúc nào.'
          ]
        },
        {
          icon: '📞',
          title: 'Liên hệ về bảo mật',
          items: [
            'Email: privacy@beeshop.vn',
            'Hotline: 1900 6688 (8h–22h, 7 ngày/tuần)',
            'Địa chỉ: 123 Tổ Ong, Hà Nội',
            'Thời gian phản hồi tối đa: 3 ngày làm việc.'
          ]
        }
      ]
    },
    {
      id: 'shipping',
      label: 'Chính sách vận chuyển',
      emoji: '🚚',
      heroIcon: 'truck',
      heroColor: '#10b981',
      subtitle: 'Giao hàng nhanh chóng, an toàn – đảm bảo sản phẩm đến tay bạn nguyên vẹn.',
      lastUpdated: '01/01/2026',
      sections: [
        {
          icon: '🎁',
          title: 'Miễn phí vận chuyển',
          items: [
            'Freeship toàn quốc cho đơn hàng từ 500.000 VNĐ trở lên.',
            'Freeship nội thành Hà Nội & TP.HCM cho đơn từ 300.000 VNĐ.',
            'Ưu đãi freeship áp dụng tự động, không cần nhập mã.',
            'Đơn hàng dưới mức freeship: phí ship từ 20.000 – 40.000 VNĐ tùy khu vực.'
          ]
        },
        {
          icon: '⏱️',
          title: 'Thời gian giao hàng',
          items: [
            'Nội thành Hà Nội & TP.HCM: 2–4 giờ (đặt trước 15h00).',
            'Tỉnh thành lân cận (bán kính 50km): 1–2 ngày làm việc.',
            'Toàn quốc: 2–5 ngày làm việc tùy địa chỉ.',
            'Đơn hàng đặt sau 17h sẽ được xử lý vào ngày làm việc kế tiếp.'
          ]
        },
        {
          icon: '📦',
          title: 'Đóng gói & Bảo vệ hàng',
          items: [
            'Sản phẩm được đóng gói chắc chắn bằng xốp và hộp carton chuyên dụng.',
            'Hàng dễ vỡ được bọc thêm nhiều lớp bảo vệ theo tiêu chuẩn.',
            'Mỗi đơn hàng đều có seal niêm phong – bạn có thể kiểm tra trước khi nhận.',
            'Túi giấy thân thiện môi trường – BeeShop cam kết xanh hóa vận chuyển.'
          ]
        },
        {
          icon: '💳',
          title: 'Phương thức nhận hàng',
          items: [
            'Giao tận nơi thông qua đối tác: GHN, GHTK, Viettel Post.',
            'Kiểm tra hàng trước khi thanh toán (COD) tại hầu hết khu vực.',
            'Nhận tại cửa hàng: 123 Tổ Ong, Hà Nội (8h–21h tất cả các ngày).',
            'Theo dõi đơn hàng real-time qua email hoặc SMS thông báo.'
          ]
        }
      ]
    },
    {
      id: 'return',
      label: 'Chính sách đổi trả',
      emoji: '🔄',
      heroIcon: 'refresh',
      heroColor: '#f59e0b',
      subtitle: 'Mua sắm an tâm – chúng tôi hỗ trợ đổi trả dễ dàng trong 7–30 ngày.',
      lastUpdated: '01/01/2026',
      sections: [
        {
          icon: '✅',
          title: 'Điều kiện đổi trả',
          items: [
            'Sản phẩm còn trong 7 ngày kể từ ngày nhận hàng.',
            'Còn nguyên tem, nhãn, chưa qua sử dụng và giữ đủ hộp + phụ kiện.',
            'Có hóa đơn mua hàng hoặc mã đơn hàng hợp lệ.',
            'Không áp dụng với hàng sale trên 50%, hàng đặt theo yêu cầu riêng.'
          ]
        },
        {
          icon: '⚡',
          title: 'Lý do được đổi trả miễn phí',
          items: [
            'Sản phẩm bị lỗi kỹ thuật từ nhà sản xuất (vỡ, sứt, méo).',
            'Nhận sai sản phẩm so với đơn hàng đã đặt.',
            'Sản phẩm bị hư hỏng trong quá trình vận chuyển.',
            'Chất lượng thực tế khác biệt đáng kể so với mô tả trên website.'
          ]
        },
        {
          icon: '📝',
          title: 'Quy trình đổi trả',
          items: [
            'Bước 1: Liên hệ hotline 1900 6688 hoặc email support@beeshop.vn.',
            'Bước 2: Cung cấp mã đơn hàng, ảnh/video minh chứng sản phẩm lỗi.',
            'Bước 3: Chờ xét duyệt trong 24h – nhận thông báo qua email.',
            'Bước 4: Gửi hàng về theo địa chỉ được cung cấp (BeeShop trả phí ship).'
          ]
        },
        {
          icon: '💰',
          title: 'Hoàn tiền & Bảo hành',
          items: [
            'Hoàn tiền 100% về phương thức thanh toán gốc trong 3–5 ngày làm việc.',
            'Hoặc đổi sang voucher mua hàng có giá trị tương đương (áp dụng ngay).',
            'Bảo hành 6–12 tháng tùy danh mục sản phẩm theo chính sách hãng.',
            'Hỗ trợ sửa chữa miễn phí trong thời gian bảo hành tại cửa hàng.'
          ]
        }
      ]
    },
    {
      id: 'payment',
      label: 'Quy định thanh toán',
      emoji: '💳',
      heroIcon: 'credit-card',
      heroColor: '#8b5cf6',
      subtitle: 'Thanh toán an toàn, đa dạng phương thức – giao dịch được mã hóa 100%.',
      lastUpdated: '01/01/2026',
      sections: [
        {
          icon: '🏦',
          title: 'Phương thức thanh toán',
          items: [
            'Thanh toán khi nhận hàng (COD) – kiểm tra hàng trước khi trả tiền.',
            'Chuyển khoản ngân hàng: Vietcombank, MB Bank, Techcombank.',
            'Ví điện tử: MoMo, ZaloPay, VNPay – thanh toán chỉ trong vài giây.',
            'Thẻ tín dụng/ghi nợ: Visa, Mastercard, JCB, American Express.'
          ]
        },
        {
          icon: '🔐',
          title: 'Bảo mật thanh toán',
          items: [
            'Giao dịch được bảo vệ bởi SSL 256-bit – chuẩn bảo mật ngân hàng.',
            'BeeShop không lưu trữ thông tin thẻ tín dụng của bạn.',
            'Cổng thanh toán tuân thủ tiêu chuẩn PCI-DSS Level 1.',
            'Xác thực hai lớp (OTP) cho mọi giao dịch trực tuyến.'
          ]
        },
        {
          icon: '🎟️',
          title: 'Mã giảm giá & Voucher',
          items: [
            'Mỗi voucher chỉ áp dụng một lần cho một đơn hàng.',
            'Không cộng gộp nhiều mã giảm giá trong cùng một đơn.',
            'Voucher có thời hạn – kiểm tra ngày hết hạn trước khi sử dụng.',
            'Voucher không có giá trị quy đổi thành tiền mặt.'
          ]
        },
        {
          icon: '🧾',
          title: 'Hóa đơn & Thuế',
          items: [
            'Xuất hóa đơn VAT theo yêu cầu – vui lòng cung cấp thông tin công ty.',
            'Email xác nhận đơn hàng tự động gửi sau khi thanh toán thành công.',
            'Lưu trữ lịch sử giao dịch trong tài khoản tối thiểu 12 tháng.',
            'Hỗ trợ xuất hóa đơn điện tử theo Nghị định 123/2020/NĐ-CP.'
          ]
        }
      ]
    }
  ];

  activePolicy = computed(() => this.policies.find(p => p.id === this.activeTab()));

  setActiveTab(tab: PolicyTab) {
    this.activeTab.set(tab);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  }

  goContact(event: Event) {
    event.preventDefault();
    this.router.navigate(['/contact']);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
