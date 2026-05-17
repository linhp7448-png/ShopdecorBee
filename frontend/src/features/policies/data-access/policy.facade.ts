import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PolicyFacade {
  readonly returnPolicy = signal([
    'Hỗ trợ đổi trả trong 7 ngày nếu sản phẩm lỗi kỹ thuật.',
    'Sản phẩm cần còn đầy đủ hộp và phụ kiện kèm theo.',
    'Hoàn tiền trong 3-5 ngày làm việc sau khi duyệt.'
  ]);

  readonly warrantyPolicy = signal([
    'Bảo hành 6-12 tháng tùy danh mục sản phẩm.',
    'Bảo hành các lỗi nhà sản xuất, không bao gồm va đập.',
    'Hỗ trợ đổi mới nếu lỗi nghiêm trọng trong 7 ngày đầu.'
  ]);

  readonly shippingPolicy = signal([
    'Freeship cho đơn từ 500.000 VNĐ.',
    'Nội thành 2-4 giờ, ngoại tỉnh 2-5 ngày.',
    'Kiểm tra hàng trước khi thanh toán (COD).' 
  ]);
}
