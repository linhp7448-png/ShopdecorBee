Feature('Tìm Kiếm & Xem Chi Tiết Sản Phẩm (Product & Category Service)');

Scenario('Tìm kiếm sản phẩm bằng thanh tìm kiếm ở Header', ({ I }) => {
  // Đi thẳng vào trang chủ
  I.amOnPage('/');
  I.waitForElement('//input[@placeholder="Tìm sản phẩm..."]', 10);
  I.fillField('//input[@placeholder="Tìm sản phẩm..."]', 'Bàn');
  I.pressKey('Enter');
  I.seeInCurrentUrl('/search');
});

Scenario('Lọc sản phẩm theo giá và thuộc tính', ({ I }) => {
  // Đi thẳng vào trang search để lọc, không qua trung gian
  I.amOnPage('/search');
  I.fillField('//input[@placeholder="Từ"]', '100000');
  I.fillField('//input[@placeholder="Đến"]', '2000000');
  I.click('Áp dụng giá');
  I.seeInCurrentUrl('minPrice=100000');
});

Scenario('Xem chi tiết một sản phẩm', ({ I }) => {
  // Đi thẳng vào trang chi tiết sản phẩm, bỏ bước I.amOnPage('/')
  I.amOnPage('/product/1'); 
  I.waitForElement('.container', 10);
  I.see('THÊM VÀO GIỎ HÀNG');
  I.see('Chi tiết sản phẩm');
});