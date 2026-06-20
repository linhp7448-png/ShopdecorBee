Feature('Đăng Ký & Đăng Nhập (Auth Service)');

Scenario('Đăng ký tài khoản khách hàng mới', ({ I }) => {
  const randomSuffix = Math.floor(Math.random() * 1000000);
  I.amOnPage('/register');
  I.fillField('fullName', 'Nguyễn Văn Bee');
  I.fillField('email', `user${randomSuffix}@example.com`);
  I.fillField('phone', '0912345678');
  I.fillField('password', '123456');
  I.click('button[type="submit"]');
  I.waitForText('thành công', 10);
});

Scenario('Đăng nhập với tài khoản khách hàng demo', ({ I }) => {
  I.amOnPage('/login');
  I.fillField('email', 'admin1@homedecorshop.local');
  I.fillField('password', 'admin123');
  I.click('button[type="submit"]');
  I.wait(5);
  I.see('Tổng quan'); // Kiểm tra xem đã vào được trang quản trị chưa
});