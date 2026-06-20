module.exports = function() {
  return actor({
    loginAsCustomer: function() {
      this.amOnPage('/login');
      this.fillField('email', 'admin1@homedecorshop.local');
      this.fillField('password', 'admin123');
      this.click('button[type="submit"]');
      // Đợi tối đa 30s cho đến khi thấy chữ Tổng quan
      this.waitForText('Tổng quan', 30); 
    },

    loginAsAdmin: function() {
      this.amOnPage('/login');
      this.fillField('email', 'admin1@homedecorshop.local');
      this.fillField('password', 'admin123');
      this.click('button[type="submit"]');
      this.waitForText('Tổng quan', 30); 
    }
  });
}