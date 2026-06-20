Feature('Quản Trị Hệ Thống (Admin Service)');

Scenario('Admin kiểm tra các trang quản lý', ({ I }) => {
  I.loginAsAdmin(); // Hàm này đã có waitForText 30s ở steps_file
  I.see('BeeAdmin');
  I.see('Tổng quan');
  
  I.click('Sản phẩm');
  I.waitForText('Quản Lý Sản Phẩm', 10);
  I.see('Danh sách Sản phẩm');
});