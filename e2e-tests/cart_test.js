Feature('Giỏ Hàng & Đặt Hàng (Cart, Order & Payment Services)');

Before(({ I }) => {
  I.loginAsCustomer(); 
});

Scenario('Thêm sản phẩm vào giỏ hàng và tiến hành đặt hàng bằng COD', ({ I }) => {
  // 1. Vào trang sản phẩm
  I.amOnPage('/product/1');
  I.waitForText('THÊM VÀO GIỎ HÀNG', 15);
  I.click('THÊM VÀO GIỎ HÀNG');
  
  // 2. Vào trang thanh toán
  I.amOnPage('/checkout');
  I.waitForElement('//input[@placeholder="Họ tên người nhận"]', 20);
  
  // 3. Điền thông tin giao hàng
  I.fillField('//input[@placeholder="Họ tên người nhận"]', 'Nguyễn Văn A');
  I.fillField('//input[@placeholder="Số điện thoại"]', '0987654321');
  I.fillField('//input[@placeholder="Địa chỉ (số nhà, đường...)"]', '123 Đường Bee');
  I.fillField('//input[@placeholder="Phường / Xã"]', 'Phường 1');
  I.fillField('//input[@placeholder="Quận / Huyện"]', 'Quận 1');
  I.fillField('//input[@placeholder="Tỉnh / Thành phố"]', 'Hồ Chí Minh');
  
  // 4. Chọn thanh toán COD
  I.click('Thanh toán khi nhận hàng (COD)');
  I.wait(2); // Đợi form validate
  
  // 5. Bấm đặt hàng
  I.forceClick('Đặt hàng');
  
  // THAY THẾ waitForNavigation BẰNG ĐOẠN DƯỚI ĐÂY:
  I.waitInUrl('/orders', 20); // Đợi URL chứa chữ /orders trong tối đa 20 giây
  I.see('Đơn hàng'); // Kiểm tra xem đã thấy chữ Đơn hàng trên trang mới chưa
});