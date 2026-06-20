const { setCommonPlugins, setHeadlessWhen } = require('@codeceptjs/configure');

// Bật chế độ chạy ngầm (headless) nếu có biến môi trường HEADLESS=true
setHeadlessWhen(process.env.HEADLESS);

// Kích hoạt các plugin mặc định của CodeceptJS
setCommonPlugins();

/** @type {CodeceptJS.MainConfig} */
exports.config = {
  tests: './*_test.js',
  output: './output',
// Trong file codecept.conf.js
helpers: {
  Playwright: {
    url: 'http://127.0.0.1:3000',
    show: true,
    browser: 'chromium',
    waitForNavigation: "networkidle0", // Đợi mạng rảnh mới chạy tiếp
    getPageTimeout: 60000 // Tăng lên 60 giây cho chắc
  }
},
  include: {
    I: './steps_file.js'
  },
  name: 'e2e-tests'
}
